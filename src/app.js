/* ==========================================================================
   L.L. CARD GAME - APPLICATION CONTROLLER (ORGANIZZAZIONE HEARTHSTONE PEEK STYLE)
   ========================================================================== */

class AppController {
    constructor() {
        try { this.engine = new GameEngine(); } catch(e) { console.error(e); }
        try { this.ai = new AIController(this.engine); } catch(e) { console.error(e); }
        try { this.multiplayer = new MultiplayerManager(); } catch(e) { console.error(e); }
        try { this.audio = new SoundSynth(); } catch(e) { console.error(e); }
        try { this.particles = new ParticleSystem('fx-canvas'); } catch(e) { console.error(e); }

        this.playerNickname = localStorage.getItem('ll_nickname') || 'Giocatore';
        this.opponentNickname = 'Avversario';

        this.selectedCardInstanceId = null;
        this.selectedBoardCardInstanceId = null;
        this.currentSpotlightCard = null;

        this.isMultiplayer = false;
        this.myRole = 'PLAYER';

        this.turnTimerInterval = null;
        this.turnTimeLeft = 30;

        this.activeBonusStateMap = new Map();

        this.initUI();
        this.updateViewportDimensions();
    }

    bindClick(elementId, handler) {
        const el = document.getElementById(elementId);
        if (el) {
            el.onclick = (e) => {
                if (e) e.stopPropagation();
                try {
                    handler(e);
                } catch (err) {
                    console.error(`Errore nel click su #${elementId}:`, err);
                }
            };
        }
    }

    bindMenuClick(elementId, handler) {
        const el = document.getElementById(elementId);
        if (el) {
            el.onclick = (e) => {
                if (e) e.stopPropagation();
                document.querySelectorAll('.btn-menu-option').forEach(b => b.classList.remove('selected'));
                el.classList.add('selected');
                try {
                    handler(e);
                } catch (err) {
                    console.error(`Errore nel click su #${elementId}:`, err);
                }
            };
        }
    }

    initUI() {
        const nickInput = document.getElementById('input-nickname-menu');
        if (nickInput) {
            nickInput.value = this.playerNickname;
            nickInput.oninput = () => {
                const val = nickInput.value.trim() || 'Giocatore';
                this.playerNickname = val;
                localStorage.setItem('ll_nickname', val);
            };
        }

        this.bindMenuClick('btn-pvai', () => this.startPvAIGame());
        this.bindMenuClick('btn-online', () => this.showScreen('screen-multiplayer'));
        this.bindMenuClick('btn-collection', () => {
            this.renderCollection('ALL');
            this.showScreen('screen-collection');
        });
        this.bindMenuClick('btn-fullscreen-menu', () => this.toggleFullscreen());
        this.bindMenuClick('btn-rules', () => this.showScreen('screen-rules'));

        this.bindClick('btn-close-lobby', () => {
            this.multiplayer.disconnect();
            this.showScreen('screen-menu');
        });

        this.bindClick('btn-fullscreen-battle', () => this.toggleFullscreen());
        this.bindClick('btn-close-rules', () => this.showScreen('screen-menu'));
        this.bindClick('btn-back-menu', () => {
            this.stopTurnTimer();
            this.multiplayer.disconnect();
            this.showScreen('screen-menu');
        });

        this.bindClick('btn-surrender', () => this.handleSurrender());
        this.bindClick('btn-end-turn', () => this.handleEndTurn());

        this.bindClick('btn-create-room', () => {
            if (this.audio) this.audio.playClick();
            this.engine.resetGame();
            this.showToast("Generazione codice stanza in corso...");

            const roomCode = this.multiplayer.createRoom(
                (info) => this.handleOnlineConnected(info),
                (msg) => this.handleOnlineMessage(msg),
                (err) => this.showToast(err)
            );

            if (roomCode) {
                const codeDisplay = document.getElementById('display-room-code');
                if (codeDisplay) codeDisplay.textContent = `LL-${roomCode}`;
                
                const infoBox = document.getElementById('room-created-info');
                if (infoBox) infoBox.style.display = 'flex';

                this.showToast(`Stanza LL-${roomCode} creata! In attesa del tuo amico...`);
            }
        });

        this.bindClick('btn-join-room', () => {
            const inputEl = document.getElementById('input-room-code');
            const inputCode = inputEl ? inputEl.value.trim() : '';
            if (!inputCode) {
                this.showToast("Inserisci il codice stanza a 4 cifre!");
                return;
            }

            if (this.audio) this.audio.playClick();
            this.engine.resetGame();
            this.showToast(`Ricerca stanza LL-${inputCode} in corso...`);

            this.multiplayer.joinRoom(
                inputCode,
                (info) => this.handleOnlineConnected(info),
                (msg) => this.handleOnlineMessage(msg),
                (err) => this.showToast(err)
            );
        });

        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.onclick = (e) => {
                if (e) e.stopPropagation();
                const emoji = e.target.dataset.emoji;
                this.spawnFloatingEmoji(emoji, true);
                if (this.isMultiplayer) {
                    this.multiplayer.send('EMOJI', { emoji });
                }
            };
        });

        const aiPortrait = document.querySelector('.zone-opponent .player-portrait');
        if (aiPortrait) {
            aiPortrait.onclick = (e) => {
                if (e) e.stopPropagation();
                if (this.selectedBoardCardInstanceId && this.isMyTurn()) {
                    const result = this.engine.attackHero(this.selectedBoardCardInstanceId);
                    if (result.success) {
                        if (this.audio) this.audio.playAttackHit();
                        if (this.particles) this.particles.createBurst(window.innerWidth / 2, 100, '#ff4757');
                        
                        if (this.isMultiplayer) {
                            this.multiplayer.send('ATTACK_HERO', { attackerId: this.selectedBoardCardInstanceId });
                        }

                        this.selectedBoardCardInstanceId = null;
                        this.showToast(result.message);
                        this.renderBattlefield();
                    } else {
                        this.showToast(result.reason);
                    }
                }
            };
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = (e) => {
                if (e) e.stopPropagation();
                if (this.audio) this.audio.playClick();
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.dataset.filter;
                this.renderCollection(filter);
            };
        });

        this.bindClick('btn-close-detail', () => {
            if (this.audio) this.audio.playClick();
            this.closeCardDetailModal();
        });

        const cardDetailModal = document.getElementById('card-detail-modal');
        if (cardDetailModal) {
            cardDetailModal.onclick = (e) => {
                if (e.target === cardDetailModal) {
                    if (this.audio) this.audio.playClick();
                    this.closeCardDetailModal();
                }
            };
        }

        this.bindClick('btn-play-from-modal', () => {
            if (this.currentSpotlightCard && this.isMyTurn()) {
                if (this.audio) this.audio.playClick();
                this.playPlayerCard(this.currentSpotlightCard.instanceId);
                this.closeCardDetailModal();
            }
        });

        this.bindClick('btn-rematch', () => {
            if (this.audio) this.audio.playClick();
            const modal = document.getElementById('game-over-modal');
            if (modal) modal.classList.remove('active');
            
            if (this.isMultiplayer) {
                this.showScreen('screen-multiplayer');
            } else {
                this.startNewGame();
            }
        });

        this.bindClick('btn-modal-menu', () => {
            if (this.audio) this.audio.playClick();
            const modal = document.getElementById('game-over-modal');
            if (modal) modal.classList.remove('active');
            
            this.multiplayer.disconnect();
            this.showScreen('screen-menu');
        });

        window.addEventListener('resize', () => {
            this.updateViewportDimensions();
            this.checkOrientation();
        });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateViewportDimensions();
                this.checkOrientation();
            }, 100);
        });

        this.checkOrientation();
    }

    updateViewportDimensions() {
        window.scrollTo(0, 0);

        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = (width > height) && (width < 1500 || height < 850);

        if (isLandscape) {
            document.body.classList.add('mobile-landscape');
            
            // Layout Hearthstone-style: carte sul campo 118px nitide, mano abbassata in basso senza alcuna sovrapposizione!
            const targetCardHeight = 118;
            const targetCardWidth = 84;

            document.documentElement.style.setProperty('--card-landscape-w', `${targetCardWidth}px`);
            document.documentElement.style.setProperty('--card-landscape-h', `${targetCardHeight}px`);
            document.documentElement.style.setProperty('--hand-container-h', `80px`);
            document.documentElement.style.setProperty('--board-row-h', `${targetCardHeight + 4}px`);
        } else {
            document.body.classList.remove('mobile-landscape');
        }
    }

    checkOrientation() {
        if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
            if (!this.hasShownOrientationToast) {
                this.showToast("🔄 Suggerimento: Ruota lo smartphone in Orizzontale per la vista panoramica ideale!");
                this.hasShownOrientationToast = true;
            }
        }
    }

    toggleFullscreen() {
        if (this.audio) this.audio.playClick();
        const docEl = document.documentElement;

        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
            if (req) {
                req.call(docEl).then(() => {
                    this.showToast("📱 Modalità Schermo Intero Attivata!");
                    this.updateViewportDimensions();
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => {});
                    }
                }).catch(() => {
                    this.showToast("📱 Schermo Intero attivato!");
                    this.updateViewportDimensions();
                });
            } else {
                this.showToast("Per lo schermo intero su iPhone, usa 'Aggiungi a Schermata Home'");
            }
        } else {
            const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
            if (exit) {
                exit.call(document).then(() => {
                    this.showToast("Modalità Schermo Intero Disattivata");
                    this.updateViewportDimensions();
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                }).catch(() => {});
            }
        }
    }

    startPvAIGame() {
        this.isMultiplayer = false;
        this.opponentNickname = '🤖 IA Avversario';
        if (this.audio) this.audio.playClick();
        
        const emojiBar = document.getElementById('emoji-bar');
        if (emojiBar) emojiBar.style.display = 'none';
        
        const avatar = document.getElementById('opponent-avatar');
        if (avatar) avatar.textContent = '🤖';

        this.showScreen('screen-battle');
        this.startNewGame();
    }

    handleSurrender() {
        if (this.audio) this.audio.playClick();
        this.stopTurnTimer();
        this.engine.gameOver = true;
        this.engine.winner = (this.myRole === 'PLAYER') ? 'AI' : 'PLAYER';
        if (this.isMultiplayer) {
            this.multiplayer.send('SURRENDER');
        }
        this.renderBattlefield();
    }

    handleEndTurn() {
        if (!this.isMyTurn() || this.engine.gameOver) return;
        if (this.audio) this.audio.playClick();
        this.stopTurnTimer();
        this.engine.endTurn();

        if (this.isMultiplayer) {
            this.multiplayer.send('END_TURN');
        }

        this.renderBattlefield();

        if (!this.isMultiplayer) {
            this.showToast("Turno dell'IA...");
            this.ai.takeTurn(
                (action) => this.handleAIAction(action),
                () => this.renderBattlefield()
            );
        }
    }

    isMyTurn() {
        if (!this.isMultiplayer) {
            return (this.engine.activePlayer === 'PLAYER');
        }
        return (this.engine.activePlayer === this.myRole);
    }

    showScreen(screenId) {
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) gameOverModal.classList.remove('active');

        const cardDetailModal = document.getElementById('card-detail-modal');
        if (cardDetailModal) cardDetailModal.classList.remove('active');

        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.style.display = 'flex';
            target.classList.add('active');
        }
        this.updateViewportDimensions();
    }

    startNewGame() {
        this.activeBonusStateMap.clear();
        this.engine.resetGame();
        this.selectedCardInstanceId = null;
        this.selectedBoardCardInstanceId = null;
        this.renderBattlefield();
        this.showToast("Inizio Partita! Mazzo condiviso da 28 carte.");
    }

    handleOnlineConnected(info) {
        this.isMultiplayer = true;
        this.myRole = info.isHost ? 'PLAYER' : 'AI';
        this.engine.resetGame();

        const emojiBar = document.getElementById('emoji-bar');
        if (emojiBar) emojiBar.style.display = 'flex';

        const avatar = document.getElementById('opponent-avatar');
        if (avatar) avatar.textContent = '👑';

        this.showScreen('screen-battle');

        if (info.isHost) {
            const initialState = {
                sharedDeck: this.engine.sharedDeck,
                playerHand: this.engine.playerHand,
                aiHand: this.engine.aiHand,
                activePlayer: this.engine.activePlayer,
                currentTurn: this.engine.currentTurn,
                hostNickname: this.playerNickname
            };
            this.multiplayer.send('INIT_GAME', initialState);
            this.renderBattlefield();
            this.showToast("Avversario connesso! La partita Online ha inizio.");
        } else {
            this.multiplayer.send('SYNC_NICKNAME', { nickname: this.playerNickname });
            this.renderBattlefield();
            this.showToast("Connesso al tavolo da gioco! Sincronizzazione in corso...");
        }
    }

    handleOnlineMessage(msg) {
        if (!msg || !msg.type) return;

        switch (msg.type) {
            case 'GUEST_READY':
                if (this.myRole === 'PLAYER' && this.isMultiplayer) {
                    if (msg.payload && msg.payload.guestNickname) {
                        this.opponentNickname = msg.payload.guestNickname;
                    }
                    this.engine.resetGame();
                    const initialState = {
                        sharedDeck: this.engine.sharedDeck,
                        playerHand: this.engine.playerHand,
                        aiHand: this.engine.aiHand,
                        activePlayer: this.engine.activePlayer,
                        currentTurn: this.engine.currentTurn,
                        hostNickname: this.playerNickname
                    };
                    this.multiplayer.send('INIT_GAME', initialState);
                    this.multiplayer.send('SYNC_NICKNAME', { nickname: this.playerNickname });
                    this.renderBattlefield();
                }
                break;

            case 'SYNC_NICKNAME':
                if (msg.payload && msg.payload.nickname) {
                    this.opponentNickname = msg.payload.nickname;
                    this.renderBattlefield();
                }
                break;

            case 'INIT_GAME':
                this.engine.resetGame();
                this.engine.sharedDeck = msg.payload.sharedDeck;
                this.engine.playerHand = msg.payload.playerHand;
                this.engine.aiHand = msg.payload.aiHand;
                this.engine.activePlayer = msg.payload.activePlayer;
                this.engine.currentTurn = msg.payload.currentTurn;
                this.engine.gameOver = false;
                this.engine.winner = null;

                if (msg.payload.hostNickname) {
                    this.opponentNickname = msg.payload.hostNickname;
                }

                this.multiplayer.send('SYNC_NICKNAME', { nickname: this.playerNickname });

                this.showScreen('screen-battle');
                this.renderBattlefield();
                this.showToast(`Partita Online contro ${this.opponentNickname} avviata!`);
                break;

            case 'PLAY_CARD':
                const oppRole = (this.myRole === 'PLAYER') ? 'AI' : 'PLAYER';
                this.engine.playCard(oppRole, msg.payload.cardInstanceId);
                if (this.audio) this.audio.playCardPlay();
                this.showToast(`${this.opponentNickname} ha schierato una carta!`);
                this.renderBattlefield();
                break;

            case 'ATTACK_CARD':
                this.engine.attackCard(msg.payload.attackerId, msg.payload.defenderId);
                if (this.audio) this.audio.playAttackHit();
                if (this.particles) this.particles.createBurst(window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
                this.showToast(`${this.opponentNickname} ha sferrato un attacco!`);
                this.renderBattlefield();
                break;

            case 'ATTACK_HERO':
                this.engine.attackHero(msg.payload.attackerId);
                if (this.audio) this.audio.playAttackHit();
                this.showToast(`${this.opponentNickname} ha attaccato direttamente il tuo Eroe!`);
                this.renderBattlefield();
                break;

            case 'END_TURN':
                this.engine.endTurn();
                if (this.audio) this.audio.playClick();
                this.showToast(`${this.opponentNickname} ha terminato il turno. Tocca a te!`);
                this.renderBattlefield();
                break;

            case 'EMOJI':
                this.spawnFloatingEmoji(msg.payload.emoji, false);
                break;

            case 'SURRENDER':
                this.engine.gameOver = true;
                this.engine.winner = this.myRole;
                this.showToast(`${this.opponentNickname} si è arreso!`);
                this.renderBattlefield();
                break;
        }
    }

    spawnFloatingEmoji(emoji, isMyEmoji) {
        const el = document.createElement('div');
        el.className = 'floating-emoji-pop';
        el.textContent = emoji;

        if (isMyEmoji) {
            el.style.bottom = '120px';
            el.style.left = '70%';
        } else {
            el.style.top = '120px';
            el.style.left = '30%';
        }

        document.body.appendChild(el);
        setTimeout(() => {
            if (document.body.contains(el)) document.body.removeChild(el);
        }, 2000);
    }

    startTurnTimer() {
        this.stopTurnTimer();
        this.turnTimeLeft = 30;

        const widget = document.getElementById('timer-widget');
        const text = document.getElementById('timer-text');
        const bar = document.getElementById('timer-bar');

        if (widget) widget.classList.remove('warning');
        if (text) text.textContent = '30s';
        if (bar) bar.style.width = '100%';

        this.turnTimerInterval = setInterval(() => {
            if (!this.isMyTurn() || this.engine.gameOver) {
                this.stopTurnTimer();
                return;
            }

            this.turnTimeLeft--;
            
            if (text) text.textContent = `${this.turnTimeLeft}s`;
            if (bar) bar.style.width = `${(this.turnTimeLeft / 30) * 100}%`;

            if (this.turnTimeLeft <= 10 && this.turnTimeLeft > 0) {
                const isUrgent = (this.turnTimeLeft <= 5);
                if (this.audio) this.audio.playTick(isUrgent);
            }

            if (this.turnTimeLeft <= 5 && widget) {
                widget.classList.add('warning');
            }

            if (this.turnTimeLeft <= 0) {
                this.stopTurnTimer();
                this.showToast("⏱️ Tempo scaduto! Turno passato automaticamente.");
                this.engine.endTurn();
                if (this.isMultiplayer) {
                    this.multiplayer.send('END_TURN');
                }
                this.renderBattlefield();

                if (!this.isMultiplayer) {
                    this.ai.takeTurn(
                        (action) => this.handleAIAction(action),
                        () => this.renderBattlefield()
                    );
                }
            }
        }, 1000);
    }

    stopTurnTimer() {
        if (this.turnTimerInterval) {
            clearInterval(this.turnTimerInterval);
            this.turnTimerInterval = null;
        }
    }

    updateActionBanner() {
        const iconEl = document.getElementById('action-status-icon');
        const msgEl = document.getElementById('action-status-msg');
        const bannerEl = document.getElementById('action-status-banner');
        const endTurnBtn = document.getElementById('btn-end-turn');

        if (!iconEl || !msgEl) return;

        if (this.isMyTurn() && !this.engine.gameOver) {
            const playedThisTurn = (this.engine.cardsPlayedThisTurn >= 1);
            const myBoard = (this.myRole === 'PLAYER') ? this.engine.playerBoard : this.engine.aiBoard;
            const readyAttackers = myBoard.filter(c => c.canAttack).length;

            if (!playedThisTurn && readyAttackers > 0) {
                iconEl.textContent = '✨⚔️';
                msgEl.textContent = `Puoi schierare 1 carta E attaccare con ${readyAttackers} carte pronte!`;
                bannerEl.className = 'action-banner';
                if (endTurnBtn) endTurnBtn.classList.remove('btn-pulse-suggest');
            } else if (!playedThisTurn) {
                iconEl.textContent = '✨';
                msgEl.textContent = `Il Tuo Turno: Tocca una carta in mano per schierarla sul campo!`;
                bannerEl.className = 'action-banner';
                if (endTurnBtn) endTurnBtn.classList.remove('btn-pulse-suggest');
            } else if (readyAttackers > 0) {
                iconEl.textContent = '⚔️';
                msgEl.textContent = `Carta schierata! Hai ancora ${readyAttackers} carte pronte ad attaccare!`;
                bannerEl.className = 'action-banner';
                if (endTurnBtn) endTurnBtn.classList.remove('btn-pulse-suggest');
            } else {
                iconEl.textContent = '✅';
                msgEl.textContent = `Mosse esaurite! Clicca "PASSA TURNO ➔" per cedere il turno all'avversario.`;
                bannerEl.className = 'action-banner finished';
                if (endTurnBtn) endTurnBtn.classList.add('btn-pulse-suggest');
            }
        } else {
            iconEl.textContent = '⏳';
            msgEl.textContent = `Turno di ${this.opponentNickname} in corso... Attendi le sue mosse.`;
            bannerEl.className = 'action-banner';
            if (endTurnBtn) endTurnBtn.classList.remove('btn-pulse-suggest');
        }
    }

    renderCollection(filter) {
        const grid = document.getElementById('cards-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const cardsToDisplay = CARDS_DATABASE.filter(c => filter === 'ALL' || c.element === filter);

        cardsToDisplay.forEach(card => {
            const cardEl = this.createCardDOM(card, false, true);
            cardEl.onclick = (e) => {
                if (e) e.stopPropagation();
                if (this.audio) this.audio.playClick();
                this.openCardDetailModal(card, false);
            };
            grid.appendChild(cardEl);
        });
    }

    renderBattlefield() {
        this.updateViewportDimensions();

        if (this.isMyTurn() && !this.engine.gameOver) {
            if (!this.turnTimerInterval) {
                this.startTurnTimer();
            }
        } else {
            this.stopTurnTimer();
        }

        const turnEl = document.getElementById('turn-num');
        if (turnEl) turnEl.textContent = this.engine.currentTurn;

        const myNavName = document.getElementById('player-name');
        if (myNavName) myNavName.textContent = this.playerNickname;

        const oppNavName = document.getElementById('opponent-name');
        if (oppNavName) oppNavName.textContent = this.opponentNickname;

        const myHp = (this.myRole === 'PLAYER') ? this.engine.playerHp : this.engine.aiHp;
        const myMaxHp = (this.myRole === 'PLAYER') ? this.engine.playerMaxHp : this.engine.aiMaxHp;
        const oppHp = (this.myRole === 'PLAYER') ? this.engine.aiHp : this.engine.playerHp;
        const oppMaxHp = (this.myRole === 'PLAYER') ? this.engine.aiMaxHp : this.engine.playerMaxHp;

        const playerHpEl = document.getElementById('player-hp');
        if (playerHpEl) playerHpEl.textContent = myHp;

        const playerHpBar = document.getElementById('player-hp-bar');
        if (playerHpBar) playerHpBar.style.width = `${(myHp / myMaxHp) * 100}%`;

        const aiHpEl = document.getElementById('ai-hp');
        if (aiHpEl) aiHpEl.textContent = oppHp;

        const aiHpBar = document.getElementById('ai-hp-bar');
        if (aiHpBar) aiHpBar.style.width = `${(oppHp / oppMaxHp) * 100}%`;

        const deckCountEl = document.getElementById('player-deck-count');
        if (deckCountEl) deckCountEl.textContent = this.engine.sharedDeck.length;

        this.updateActionBanner();

        const myHand = (this.myRole === 'PLAYER') ? this.engine.playerHand : this.engine.aiHand;
        const oppHand = (this.myRole === 'PLAYER') ? this.engine.aiHand : this.engine.playerHand;
        const myBoard = (this.myRole === 'PLAYER') ? this.engine.playerBoard : this.engine.aiBoard;
        const oppBoard = (this.myRole === 'PLAYER') ? this.engine.aiBoard : this.engine.playerBoard;

        // Render Mano Coperte Avversario
        const aiHandContainer = document.getElementById('ai-hand-cards');
        if (aiHandContainer) {
            aiHandContainer.innerHTML = '';
            oppHand.forEach(() => {
                const backEl = document.createElement('div');
                backEl.className = 'card-back-mini';
                aiHandContainer.appendChild(backEl);
            });
        }

        // Render Mano Giocatore (Tu)
        const handContainer = document.getElementById('player-hand');
        if (handContainer) {
            handContainer.innerHTML = '';
            myHand.forEach(card => {
                const cardEl = this.createCardDOM(card, true, false);
                
                if (this.selectedCardInstanceId === card.instanceId) {
                    cardEl.classList.add('selected');
                }

                cardEl.onclick = (e) => {
                    if (e) e.stopPropagation();
                    if (this.audio) this.audio.playCardDraw();
                    this.openCardDetailModal(card, true);
                };

                handContainer.appendChild(cardEl);
            });
        }

        // Render Campo Giocatore (Tua fila)
        const playerBoardEl = document.getElementById('player-board');
        if (playerBoardEl) {
            playerBoardEl.innerHTML = '';
            if (myBoard.length === 0) {
                playerBoardEl.innerHTML = '<div class="empty-board-msg">Tocca una carta in mano per ingrandirla o schierarla</div>';
            } else {
                myBoard.forEach(card => {
                    const cardEl = this.createCardDOM(card, false, false);
                    cardEl.classList.add('board-card');

                    if (card.canAttack && this.isMyTurn()) {
                        cardEl.classList.add('can-attack');
                    }

                    if (this.selectedBoardCardInstanceId === card.instanceId) {
                        cardEl.classList.add('selected');
                    }

                    cardEl.onclick = (e) => {
                        if (e) e.stopPropagation();
                        this.handlePlayerBoardCardClick(card);
                    };

                    playerBoardEl.appendChild(cardEl);
                    this.checkAndAnimateBonusActivation(card, cardEl);
                });
            }
        }

        // Render Campo Avversario (Fila nemica)
        const aiBoardEl = document.getElementById('ai-board');
        if (aiBoardEl) {
            aiBoardEl.innerHTML = '';
            if (oppBoard.length === 0) {
                aiBoardEl.innerHTML = '<div class="empty-board-msg">Nessuna carta schierata dall\'avversario (Tocca l\'Eroe per attaccare direttamente)</div>';
            } else {
                oppBoard.forEach(card => {
                    const cardEl = this.createCardDOM(card, false, false);
                    cardEl.classList.add('board-card');

                    cardEl.onclick = (e) => {
                        if (e) e.stopPropagation();
                        this.handleAIBoardCardClick(card);
                    };

                    aiBoardEl.appendChild(cardEl);
                    this.checkAndAnimateBonusActivation(card, cardEl);
                });
            }
        }

        if (this.engine.gameOver) {
            this.stopTurnTimer();
            this.showGameOverModal();
        }
    }

    createCardDOM(card, inHand = false, inCollection = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.borderColor = card.elementColor || '#c084fc';

        if (card.image) {
            cardEl.style.backgroundImage = `url('${card.image}')`;
        }

        const bonusAtk = card.currentBonusAtk || 0;
        const bonusHp = card.currentBonusHp || 0;
        const hasBonusActive = (bonusAtk > 0 || bonusHp > 0);

        if (hasBonusActive && !inCollection) {
            cardEl.classList.add('bonus-active');
        }

        const totalAtk = card.attack + bonusAtk;
        const totalHp = (card.currentHp !== undefined ? card.currentHp : card.hp) + bonusHp;

        let bonusTagHTML = '';
        if (hasBonusActive && !inCollection) {
            const bonusTextLabel = bonusAtk > 0 ? `⚡ +${bonusAtk} ATT!` : `🛡️ +${bonusHp} VITA!`;
            bonusTagHTML = `<div class="card-bonus-tag">${bonusTextLabel}</div>`;
        }

        const atkClass = bonusAtk > 0 ? 'stat-badge stat-atk stat-boosted' : 'stat-badge stat-atk';
        const hpClass = bonusHp > 0 ? 'stat-badge stat-hp stat-boosted' : 'stat-badge stat-hp';

        cardEl.innerHTML = `
            ${bonusTagHTML}
            <div class="card-overlay-stats">
                <div class="${atkClass}" title="Attacco">${totalAtk}</div>
                <div class="${hpClass}" title="Vita">${totalHp}</div>
            </div>
        `;

        return cardEl;
    }

    triggerBonusCutIn(cardName, bonusMessage) {
        const cutIn = document.createElement('div');
        cutIn.className = 'bonus-cutin-overlay';
        cutIn.innerHTML = `
            <div class="bonus-cutin-content">
                ⚡ POWER UP! ${cardName}<br><span style="color:#c084fc; font-size:2.2rem;">${bonusMessage}</span>
            </div>
        `;
        document.body.appendChild(cutIn);

        if (this.audio) this.audio.playBonusPowerUp();
        if (this.particles) this.particles.createBurst(window.innerWidth / 2, window.innerHeight / 2, '#c084fc');

        setTimeout(() => {
            if (document.body.contains(cutIn)) {
                document.body.removeChild(cutIn);
            }
        }, 1800);
    }

    checkAndAnimateBonusActivation(card, cardEl) {
        const prevBonusAtk = this.activeBonusStateMap.get(card.instanceId + '_atk') || 0;
        const prevBonusHp = this.activeBonusStateMap.get(card.instanceId + '_hp') || 0;

        const currentBonusAtk = card.currentBonusAtk || 0;
        const currentBonusHp = card.currentBonusHp || 0;

        if (currentBonusAtk > prevBonusAtk) {
            const diff = currentBonusAtk - prevBonusAtk;
            this.spawnFloatingBonusText(cardEl, `⚡ +${diff} ATT!`, '#c084fc');
            this.triggerBonusCutIn(card.name, `+${diff} ATTACCO PER QUESTO TURNO!`);
        }

        if (currentBonusHp > prevBonusHp) {
            const diff = currentBonusHp - prevBonusHp;
            this.spawnFloatingBonusText(cardEl, `🛡️ +${diff} VITA!`, '#2ed573');
            this.triggerBonusCutIn(card.name, `+${diff} VITA PER QUESTO TURNO!`);
        }

        this.activeBonusStateMap.set(card.instanceId + '_atk', currentBonusAtk);
        this.activeBonusStateMap.set(card.instanceId + '_hp', currentBonusHp);
    }

    spawnFloatingBonusText(cardEl, text, color) {
        setTimeout(() => {
            const rect = cardEl.getBoundingClientRect();
            if (rect.width === 0) return;

            const pop = document.createElement('div');
            pop.className = 'bonus-floating-pop';
            pop.textContent = text;
            pop.style.left = `${rect.left + rect.width / 2}px`;
            pop.style.top = `${rect.top + 20}px`;
            pop.style.color = color;

            document.body.appendChild(pop);

            setTimeout(() => {
                if (document.body.contains(pop)) {
                    document.body.removeChild(pop);
                }
            }, 1600);
        }, 100);
    }

    openCardDetailModal(card, canPlay = false) {
        this.currentSpotlightCard = card;

        const nameEl = document.getElementById('detail-card-name');
        if (nameEl) nameEl.textContent = card.name;

        const elemEl = document.getElementById('detail-card-elem');
        if (elemEl) {
            elemEl.textContent = `Elemento: ${card.element}`;
            elemEl.style.borderColor = card.elementColor;
            elemEl.style.color = card.elementColor;
        }

        const totalAtk = card.attack + (card.currentBonusAtk || 0);
        const totalHp = (card.currentHp !== undefined ? card.currentHp : card.hp) + (card.currentBonusHp || 0);

        const atkEl = document.getElementById('detail-card-atk');
        if (atkEl) atkEl.textContent = `ATT: ${totalAtk}`;

        const hpEl = document.getElementById('detail-card-hp');
        if (hpEl) hpEl.textContent = `VITA: ${totalHp}`;

        const bonusEl = document.getElementById('detail-card-bonus');
        if (bonusEl) bonusEl.textContent = card.bonusText || 'Nessun bonus attivo';

        const loreEl = document.getElementById('detail-card-lore');
        if (loreEl) loreEl.textContent = `"${card.lore || ''}"`;

        const imgEl = document.getElementById('detail-card-img');
        if (imgEl) {
            imgEl.style.backgroundImage = `url('${card.image}')`;
            imgEl.style.borderColor = card.elementColor;
        }

        const playBtn = document.getElementById('btn-play-from-modal');
        if (playBtn) {
            if (canPlay && this.isMyTurn() && !this.engine.gameOver) {
                playBtn.style.display = 'inline-flex';
            } else {
                playBtn.style.display = 'none';
            }
        }

        const modal = document.getElementById('card-detail-modal');
        if (modal) modal.classList.add('active');
    }

    closeCardDetailModal() {
        const modal = document.getElementById('card-detail-modal');
        if (modal) modal.classList.remove('active');
        this.currentSpotlightCard = null;
    }

    playPlayerCard(instanceId) {
        const result = this.engine.playCard(this.myRole, instanceId);
        if (result.success) {
            if (this.audio) this.audio.playCardPlay();
            this.selectedCardInstanceId = null;
            
            if (this.isMultiplayer) {
                this.multiplayer.send('PLAY_CARD', { cardInstanceId: instanceId });
            }

            this.showToast(result.message);
            this.renderBattlefield();
        } else {
            this.showToast(result.reason);
        }
    }

    handlePlayerBoardCardClick(card) {
        if (!this.isMyTurn() || this.engine.gameOver) return;

        if (card.canAttack) {
            if (this.selectedBoardCardInstanceId === card.instanceId) {
                this.selectedBoardCardInstanceId = null;
            } else {
                this.selectedBoardCardInstanceId = card.instanceId;
                this.showToast(`Hai selezionato ${card.name}. Tocca l'Eroe Avversario o una carta nemica per attaccare!`);
            }
            this.renderBattlefield();
        } else {
            this.openCardDetailModal(card, false);
        }
    }

    handleAIBoardCardClick(aiCard) {
        if (!this.isMyTurn() || this.engine.gameOver) return;

        if (this.selectedBoardCardInstanceId) {
            const myBoard = (this.myRole === 'PLAYER') ? this.engine.playerBoard : this.engine.aiBoard;
            const attacker = myBoard ? myBoard.find(c => c.instanceId === this.selectedBoardCardInstanceId) : null;
            
            if (attacker && attacker.bonusType === 'ATT_VS_ELEMENT' && aiCard.element === attacker.targetElement) {
                this.triggerBonusCutIn(attacker.name, `+${attacker.bonusValue} ATTACCO CONTRO ${aiCard.element}!`);
            }

            const result = this.engine.attackCard(this.selectedBoardCardInstanceId, aiCard.instanceId);
            if (result.success) {
                if (this.audio) this.audio.playAttackHit();
                if (this.particles) this.particles.createBurst(window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
                
                if (this.isMultiplayer) {
                    this.multiplayer.send('ATTACK_CARD', {
                        attackerId: this.selectedBoardCardInstanceId,
                        defenderId: aiCard.instanceId
                    });
                }

                this.selectedBoardCardInstanceId = null;
                this.showToast(result.message);
                this.renderBattlefield();
            } else {
                this.showToast(result.reason);
            }
        } else {
            this.openCardDetailModal(aiCard, false);
        }
    }

    handleAIAction(action) {
        if (action.type === 'PLAY_CARD') {
            if (this.audio) this.audio.playCardPlay();
            this.showToast(`L'IA ha schierato ${action.card.name}!`);
        } else if (action.type === 'ATTACK_CARD') {
            if (this.audio) this.audio.playAttackHit();
            if (this.particles) this.particles.createBurst(window.innerWidth / 2, window.innerHeight / 2, '#ff4757');
            this.showToast(action.result.message);
        } else if (action.type === 'ATTACK_HERO') {
            if (this.audio) this.audio.playAttackHit();
            this.showToast(action.result.message);
        }
        this.renderBattlefield();
    }

    showGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');

        if (title && desc) {
            const myHp = (this.myRole === 'PLAYER') ? this.engine.playerHp : this.engine.aiHp;
            const oppHp = (this.myRole === 'PLAYER') ? this.engine.aiHp : this.engine.playerHp;
            const myBoard = (this.myRole === 'PLAYER') ? this.engine.playerBoard.length : this.engine.aiBoard.length;
            const oppBoard = (this.myRole === 'PLAYER') ? this.engine.aiBoard.length : this.engine.playerBoard.length;

            if (this.engine.winner === this.myRole) {
                title.textContent = "VITTORIA! 🎉";
                desc.textContent = `Hai trionfato (${this.playerNickname})! Tuoi HP: ${myHp} (${myBoard} carte) vs ${this.opponentNickname} HP: ${oppHp} (${oppBoard} carte).`;
                if (this.audio) this.audio.playVictory();
                if (this.particles) this.particles.startConfetti();
            } else if (this.engine.winner === 'DRAW') {
                title.textContent = "PAREGGIO 🤝";
                desc.textContent = `Partita paritaria al termine dei 15 turni! HP Tuoi: ${myHp} vs Avversario: ${oppHp}.`;
            } else {
                title.textContent = "SCONFITTA 💀";
                desc.textContent = `${this.opponentNickname} ha vinto! Tuoi HP: ${myHp} (${myBoard} carte) vs ${this.opponentNickname} HP: ${oppHp} (${oppBoard} carte).`;
                if (this.audio) this.audio.playDefeat();
            }
        }

        if (modal) modal.classList.add('active');
    }

    showToast(message) {
        const layer = document.getElementById('toast-layer');
        if (!layer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        layer.appendChild(toast);

        setTimeout(() => {
            if (layer.contains(toast)) layer.removeChild(toast);
        }, 2600);
    }
}

// Inizializzazione globale istantanea
window.app = new AppController();
