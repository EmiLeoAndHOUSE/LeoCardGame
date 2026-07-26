/* ==========================================================================
   L.L. CARD GAME - MOTORE DI GIOCO (REGOLE DI VITTORIA ROBUSTE CON PRIORITÀ BIANCO)
   ========================================================================== */

class GameEngine {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        this.currentTurn = 1;
        this.maxTurns = 15;
        this.activePlayer = 'PLAYER'; // 'PLAYER' oppure 'AI'
        
        // Statistiche Eroi
        this.playerHp = 150;
        this.playerMaxHp = 150;
        this.aiHp = 150;
        this.aiMaxHp = 150;

        // Regola Carte Per Turno
        this.cardsPlayedThisTurn = 0;
        this.maxCardsPerTurn = 1;

        // UNICO MAZZO CONDIVISO DA 28 CARTE UNICHE
        this.sharedDeck = generateSharedDeck();

        this.playerHand = [];
        this.aiHand = [];

        this.playerBoard = []; // Max 4 carte
        this.aiBoard = [];     // Max 4 carte

        this.maxBoardSize = 4;
        this.maxHandSize = 7;

        this.gameOver = false;
        this.winner = null;

        // Pesca mano iniziale alternativa dallo stesso mazzo al centro (5 carte a testa)
        for (let i = 0; i < 5; i++) {
            this.drawCard('PLAYER');
            this.drawCard('AI');
        }
    }

    drawCard(player) {
        if (this.sharedDeck.length === 0) return null;

        const card = this.sharedDeck.pop();
        if (player === 'PLAYER') {
            if (this.playerHand.length < this.maxHandSize) {
                this.playerHand.push(card);
                return card;
            }
        } else {
            if (this.aiHand.length < this.maxHandSize) {
                this.aiHand.push(card);
                return card;
            }
        }
        return null;
    }

    playCard(player, cardInstanceId) {
        if (this.gameOver) return { success: false, reason: "La partita è terminata" };

        const isPlayer = (player === 'PLAYER');
        const hand = isPlayer ? this.playerHand : this.aiHand;
        const board = isPlayer ? this.playerBoard : this.aiBoard;

        if (this.cardsPlayedThisTurn >= this.maxCardsPerTurn) {
            return { success: false, reason: "Hai già giocato una carta in questo turno!" };
        }

        if (board.length >= this.maxBoardSize) {
            return { success: false, reason: "Il campo di battaglia è pieno! (Max 4 carte)" };
        }

        const cardIndex = hand.findIndex(c => c.instanceId === cardInstanceId);
        if (cardIndex === -1) {
            return { success: false, reason: "Carta non trovata in mano" };
        }

        const card = hand.splice(cardIndex, 1)[0];

        // REGOLE UFFICIALI TIPO BIANCO: Bonus Priorità (può entrare in campo ed attaccare nello stesso turno!)
        if (card.element === 'Bianco') {
            card.canAttack = true;
        } else {
            card.canAttack = false;
        }

        board.push(card);
        this.cardsPlayedThisTurn++;

        this.updateCardBonusStates();

        let msg = `${isPlayer ? 'Hai' : 'L\'IA ha'} schierato ${card.name}!`;
        if (card.element === 'Bianco') {
            msg += ` ⚡ Bonus Priorità (Bianco): Può attaccare subito!`;
        }

        return {
            success: true,
            card: card,
            message: msg
        };
    }

    updateCardBonusStates() {
        const allBoardCards = [...this.playerBoard, ...this.aiBoard];
        
        const updateBoard = (board) => {
            board.forEach(card => {
                card.currentBonusAtk = 0;
                card.currentBonusHp = 0;

                if (card.bonusType === 'ATT_IF_ELEMENT_ON_BOARD') {
                    const exists = allBoardCards.some(c => c.element === card.targetElement);
                    if (exists) card.currentBonusAtk += card.bonusValue;
                }
                
                if (card.bonusType === 'VITA_IF_ELEMENT_ON_BOARD') {
                    const exists = board.some(c => c.element === card.targetElement);
                    if (exists) card.currentBonusHp += card.bonusValue;
                }

                if (card.bonusType === 'ATT_VS_ALL') {
                    card.currentBonusAtk += card.bonusValue;
                }

                if (card.bonusType === 'VITA_VS_ALL') {
                    card.currentBonusHp += card.bonusValue;
                }
            });
        };

        updateBoard(this.playerBoard);
        updateBoard(this.aiBoard);
    }

    attackCard(attackerInstanceId, defenderInstanceId) {
        if (this.gameOver) return { success: false, reason: "Partita finita" };

        const isPlayerAttacking = (this.activePlayer === 'PLAYER');
        const attackerBoard = isPlayerAttacking ? this.playerBoard : this.aiBoard;
        const defenderBoard = isPlayerAttacking ? this.aiBoard : this.playerBoard;

        const attacker = attackerBoard.find(c => c.instanceId === attackerInstanceId);
        const defender = defenderBoard.find(c => c.instanceId === defenderInstanceId);

        if (!attacker || !defender) {
            return { success: false, reason: "Carta attaccante o difendente non trovata" };
        }

        if (!attacker.canAttack) {
            return { success: false, reason: "Questa carta ha già attaccato in questo turno!" };
        }

        let atkDamage = attacker.attack + attacker.currentBonusAtk;
        
        // BONUS ELEMENTALE SPECIFICO ATTACCO VS ELEMENTO NEMICO
        if (attacker.bonusType === 'ATT_VS_ELEMENT' && defender.element === attacker.targetElement) {
            atkDamage += attacker.bonusValue;
        }

        defender.currentHp -= atkDamage;
        attacker.canAttack = false;

        let resultMsg = `${attacker.name} ha attaccato ${defender.name} infliggendo ${atkDamage} danni!`;

        if (defender.currentHp <= 0) {
            const idx = defenderBoard.findIndex(c => c.instanceId === defenderInstanceId);
            if (idx !== -1) defenderBoard.splice(idx, 1);
            resultMsg += ` ${defender.name} è stata distrutta! 💥`;
        }

        this.checkWinConditions();

        return {
            success: true,
            damageDealt: atkDamage,
            defenderDestroyed: defender.currentHp <= 0,
            message: resultMsg
        };
    }

    attackHero(attackerInstanceId) {
        if (this.gameOver) return { success: false, reason: "Partita finita" };

        const isPlayerAttacking = (this.activePlayer === 'PLAYER');
        const attackerBoard = isPlayerAttacking ? this.playerBoard : this.aiBoard;
        const defenderBoard = isPlayerAttacking ? this.aiBoard : this.playerBoard;

        const attacker = attackerBoard.find(c => c.instanceId === attackerInstanceId);

        if (!attacker) return { success: false, reason: "Carta non trovata sul campo" };
        if (!attacker.canAttack) return { success: false, reason: "Questa carta non può attaccare" };

        if (defenderBoard.length > 0) {
            return { success: false, reason: "Devi prima distruggere le carte nemiche sul campo prima di attaccare l'Eroe!" };
        }

        let atkDamage = attacker.attack + attacker.currentBonusAtk;

        if (isPlayerAttacking) {
            this.aiHp = Math.max(0, this.aiHp - atkDamage);
        } else {
            this.playerHp = Math.max(0, this.playerHp - atkDamage);
        }

        attacker.canAttack = false;

        this.checkWinConditions();

        return {
            success: true,
            damageDealt: atkDamage,
            message: `${attacker.name} ha attaccato direttamente l'Eroe Avversario infliggendo ${atkDamage} danni!`
        };
    }

    endTurn() {
        if (this.gameOver) return;

        if (this.activePlayer === 'PLAYER') {
            this.activePlayer = 'AI';
            this.cardsPlayedThisTurn = 0;
            this.drawCard('AI');
            this.aiBoard.forEach(c => c.canAttack = true);
        } else {
            this.activePlayer = 'PLAYER';
            this.currentTurn++;
            this.cardsPlayedThisTurn = 0;
            this.drawCard('PLAYER');
            this.playerBoard.forEach(c => c.canAttack = true);
        }

        this.updateCardBonusStates();
        this.checkWinConditions();
    }

    checkWinConditions() {
        // 1. MORTE ISTANTANEA PER AZZERAMENTO HP
        if (this.playerHp <= 0 && this.aiHp <= 0) {
            this.gameOver = true;
            this.winner = 'DRAW';
            return;
        }
        
        if (this.aiHp <= 0) {
            this.gameOver = true;
            this.winner = 'PLAYER';
            return;
        }
        
        if (this.playerHp <= 0) {
            this.gameOver = true;
            this.winner = 'AI';
            return;
        }

        // 2. FINE PARTITA PER LIMITE TURNI (15 TURNI) O MAZZO/MANI ESAURITE
        const isDeckAndHandEmpty = (this.sharedDeck.length === 0 && this.playerHand.length === 0 && this.aiHand.length === 0);

        if (this.currentTurn > this.maxTurns || isDeckAndHandEmpty) {
            this.gameOver = true;

            // VALUTAZIONE PRIMARIA: HP RESIDUI
            if (this.playerHp > this.aiHp) {
                this.winner = 'PLAYER';
            } else if (this.aiHp > this.playerHp) {
                this.winner = 'AI';
            } else {
                // SPAREGGIO 1: NUMERO CARTE IN CAMPO
                if (this.playerBoard.length > this.aiBoard.length) {
                    this.winner = 'PLAYER';
                } else if (this.aiBoard.length > this.playerBoard.length) {
                    this.winner = 'AI';
                } else {
                    // SPAREGGIO 2: NUMERO CARTE IN MANO
                    if (this.playerHand.length > this.aiHand.length) {
                        this.winner = 'PLAYER';
                    } else if (this.aiHand.length > this.playerHand.length) {
                        this.winner = 'AI';
                    } else {
                        this.winner = 'DRAW';
                    }
                }
            }
        }
    }
}
