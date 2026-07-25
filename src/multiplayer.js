/* ==========================================================================
   L.L. CARD GAME - MULTIPLAYER MANAGER (CLOUD WEBSOCKET REALTIME RELAY)
   ========================================================================== */

class MultiplayerManager {
    constructor() {
        this.client = null;
        this.isHost = false;
        this.connected = false;
        this.roomCode = null;

        this.onConnectedCallback = null;
        this.onMessageCallback = null;

        // Broker WebSocket pubblici ultra-veloci in HTTPS (Porta 8084 / 443)
        this.brokerURLs = [
            'wss://broker.emqx.io:8084/mqtt',
            'wss://test.mosquitto.org:8081',
            'wss://broker.hivemq.com:8000/mqtt'
        ];
        this.currentBrokerIndex = 0;
    }

    loadMQTTDynamically(callback) {
        if (typeof mqtt !== 'undefined') {
            callback(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/mqtt@5.3.0/dist/mqtt.min.js';
        script.onload = () => callback(true);
        script.onerror = () => {
            const script2 = document.createElement('script');
            script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/mqtt/4.3.7/mqtt.min.js';
            script2.onload = () => callback(true);
            script2.onerror = () => callback(false);
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
    }

    createRoom(onConnected, onMessage, onError) {
        this.loadMQTTDynamically((success) => {
            if (!success) {
                if (onError) onError("Impossibile caricare la rete di gioco. Verifica la connessione a Internet.");
                return;
            }

            this.isHost = true;
            this.onConnectedCallback = onConnected;
            this.onMessageCallback = onMessage;

            const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
            this.roomCode = randomCode;

            this.connectToBroker(
                () => {
                    const hostTopic = `llcg/v2/room/${this.roomCode}/host`;
                    this.client.subscribe(hostTopic, (err) => {
                        if (err) {
                            if (onError) onError("Errore creazione stanza.");
                        } else {
                            console.log(`Stanza LL-${this.roomCode} creata con successo sul Cloud Server!`);
                        }
                    });
                },
                onError
            );
        });

        return this.roomCode || "WAIT";
    }

    joinRoom(code, onConnected, onMessage, onError) {
        this.loadMQTTDynamically((success) => {
            if (!success) {
                if (onError) onError("Impossibile caricare la rete di gioco. Verifica la connessione a Internet.");
                return;
            }

            this.isHost = false;
            this.roomCode = code.trim();
            this.onConnectedCallback = onConnected;
            this.onMessageCallback = onMessage;

            this.connectToBroker(
                () => {
                    const guestTopic = `llcg/v2/room/${this.roomCode}/guest`;
                    this.client.subscribe(guestTopic, (err) => {
                        if (err) {
                            if (onError) onError("Impossibile entrare nella stanza " + this.roomCode);
                        } else {
                            console.log(`Guest iscritto alla stanza LL-${this.roomCode}! Inizio handshake...`);
                            // Invia segnale di avvio all'Host
                            this.send('GUEST_READY', { roomCode: this.roomCode });
                        }
                    });
                },
                onError
            );
        });
    }

    connectToBroker(onReady, onError) {
        if (this.client) {
            try { this.client.end(true); } catch(e) {}
        }

        const brokerUrl = this.brokerURLs[this.currentBrokerIndex];
        const clientId = 'llcg_' + Math.random().toString(16).substr(2, 8);

        try {
            this.client = mqtt.connect(brokerUrl, {
                clientId: clientId,
                keepalive: 30,
                clean: true,
                reconnectPeriod: 2000,
                connectTimeout: 8000
            });

            this.client.on('connect', () => {
                console.log(`Connesso al Cloud Server Multiplayer: ${brokerUrl}`);
                if (onReady) onReady();
            });

            this.client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    
                    if (data.type === 'GUEST_READY' && this.isHost) {
                        this.connected = true;
                        if (this.onConnectedCallback) {
                            this.onConnectedCallback({ isHost: true, roomCode: this.roomCode });
                        }
                    } else if (data.type === 'INIT_GAME' && !this.isHost) {
                        this.connected = true;
                        if (this.onConnectedCallback) {
                            this.onConnectedCallback({ isHost: false, roomCode: this.roomCode });
                        }
                    }

                    if (this.onMessageCallback) {
                        this.onMessageCallback(data);
                    }
                } catch (e) {
                    console.error("Errore parsing messaggio Cloud:", e);
                }
            });

            this.client.on('error', (err) => {
                console.error("Errore Cloud Broker:", err);
                // Prova il broker successivo in caso di errore
                this.currentBrokerIndex = (this.currentBrokerIndex + 1) % this.brokerURLs.length;
                if (onError) onError("Errore di connessione al server di gioco. Riprova.");
            });

        } catch (e) {
            console.error("Eccezione connessione MQTT:", e);
            if (onError) onError("Impossibile connettersi al server cloud.");
        }
    }

    send(type, payload = {}) {
        if (!this.client || !this.roomCode) return;

        const targetTopic = this.isHost 
            ? `llcg/v2/room/${this.roomCode}/guest`
            : `llcg/v2/room/${this.roomCode}/host`;

        const messageStr = JSON.stringify({ type, payload });

        try {
            this.client.publish(targetTopic, messageStr, { qos: 1 });
        } catch (e) {
            console.error("Errore invio messaggio Cloud:", e);
        }
    }

    disconnect() {
        if (this.client) {
            try { this.client.end(true); } catch(e) {}
        }
        this.client = null;
        this.connected = false;
        this.isHost = false;
        this.roomCode = null;
    }
}
