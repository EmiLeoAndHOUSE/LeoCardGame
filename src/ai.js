/* ==========================================================================
   L.L. CARD GAME - INTELLIGENZA ARTIFICIALE (SENZA MANA)
   ========================================================================== */

class AIController {
    constructor(engine) {
        this.engine = engine;
    }

    takeTurn(onActionCallback, onCompleteCallback) {
        if (this.engine.activePlayer !== 'AI' || this.engine.gameOver) {
            if (onCompleteCallback) onCompleteCallback();
            return;
        }

        setTimeout(() => {
            this.playBestCard(onActionCallback, () => {
                setTimeout(() => {
                    this.executeAttacks(onActionCallback, () => {
                        setTimeout(() => {
                            this.engine.endTurn();
                            if (onActionCallback) onActionCallback({ type: 'END_TURN', message: "L'IA ha terminato il turno." });
                            if (onCompleteCallback) onCompleteCallback();
                        }, 600);
                    });
                }, 600);
            });
        }, 800);
    }

    playBestCard(onActionCallback, done) {
        if (this.engine.aiHand.length === 0 || this.engine.aiBoard.length >= this.engine.maxBoardSize) {
            done();
            return;
        }

        // Trova la carta con le migliori statistiche (Attacco + Vita)
        let bestCard = null;
        let bestScore = -1;

        this.engine.aiHand.forEach(card => {
            const score = card.attack + card.hp;
            if (score > bestScore) {
                bestScore = score;
                bestCard = card;
            }
        });

        if (bestCard) {
            const result = this.engine.playCard('AI', bestCard.instanceId);
            if (result.success && onActionCallback) {
                onActionCallback({ type: 'PLAY_CARD', card: bestCard, result });
            }
        }

        done();
    }

    executeAttacks(onActionCallback, done) {
        const readyAttackers = this.engine.aiBoard.filter(c => c.canAttack);
        if (readyAttackers.length === 0) {
            done();
            return;
        }

        let attackIndex = 0;

        const performNextAttack = () => {
            if (attackIndex >= readyAttackers.length || this.engine.gameOver) {
                done();
                return;
            }

            const attacker = readyAttackers[attackIndex];
            attackIndex++;

            if (this.engine.playerBoard.length > 0) {
                // Scegli il difensore migliore da attaccare
                let targetDefender = this.engine.playerBoard[0];
                let minHp = 999;

                this.engine.playerBoard.forEach(def => {
                    if (def.currentHp < minHp) {
                        minHp = def.currentHp;
                        targetDefender = def;
                    }
                });

                const result = this.engine.attackCard(attacker.instanceId, targetDefender.instanceId);
                if (onActionCallback) {
                    onActionCallback({ type: 'ATTACK_CARD', result });
                }
            } else {
                // Attacca l'Eroe direttamente!
                const result = this.engine.attackHero(attacker.instanceId);
                if (onActionCallback) {
                    onActionCallback({ type: 'ATTACK_HERO', result });
                }
            }

            setTimeout(performNextAttack, 700);
        };

        performNextAttack();
    }
}
