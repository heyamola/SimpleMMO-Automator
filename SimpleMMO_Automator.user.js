// ==UserScript==
// @name         SimpleMMO Automator
// @namespace    http://tampermonkey.net/
// @updateURL    https://raw.githubusercontent.com/YourUsername/YourRepo/main/SimpleMMO_Automator.user.js
// @downloadURL  https://raw.githubusercontent.com/YourUsername/YourRepo/main/SimpleMMO_Automator.user.js
// @version      1.1
// @description  Automate travel, attack, and gather actions in SimpleMMO
// @author       You
// @match        https://web.simple-mmo.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // --- USER CONFIGURATION ---
    const TURN_INTERVAL = 1500;
    const RANDOM_SLEEP_MIN = 250;
    const RANDOM_SLEEP_MAX = 750;

    /* =============================
       UTILITY
    ============================= */

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function randomSleep() {
        const delay =
            Math.floor(Math.random() * (RANDOM_SLEEP_MAX - RANDOM_SLEEP_MIN + 1))
            + RANDOM_SLEEP_MIN;
        return sleep(delay);
    }

    function isVisible(el) {
        return el && el.offsetParent !== null;
    }

    function isBtnDisabled(btn) {
        if (!btn) return true;
        if (btn.disabled) return true;
        if (btn.hasAttribute('disabled') && btn.getAttribute('disabled') !== 'false') return true;
        if (btn.classList.contains('opacity-40') || btn.classList.contains('opacity-50')) return true;
        return false;
    }

    /* =============================
       BUTTON FINDERS
    ============================= */

    function findAttackPageAttackButton() {
        const btn = document.querySelector('button[x-on\\:click="attack(false);"]');
        if (btn && !isBtnDisabled(btn) && isVisible(btn)) {
            return btn;
        }
        return null;
    }

    function findAttackPageLeaveButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Leave' && !isBtnDisabled(btn) && isVisible(btn)) {
                return btn;
            }
        }
        return null;
    }

    function findTravelAttackButton() {
        // Attack buttons that pop up during travel
        const travelAttackBtns = document.querySelectorAll('a[href^="/npcs/attack/"] button');
        for (const travelBtn of travelAttackBtns) {
            if (!isBtnDisabled(travelBtn) && isVisible(travelBtn)) {
                const aTag = travelBtn.closest('a');
                if (aTag && isVisible(aTag)) {
                    return aTag; // We click the A tag wrapper usually
                }
            }
        }
        return null;
    }

    function findGatherModalButton() {
        const btn = document.querySelector('#gather_button');
        if (btn && !isBtnDisabled(btn) && isVisible(btn)) {
            return btn;
        }
        return null;
    }

    function findGatherStartButton() {
        const buttons = document.querySelectorAll('button[x-on\\:click*="show-gathering-modal"]');
        for (const btn of buttons) {
            if (!isBtnDisabled(btn) && isVisible(btn)) {
                return btn;
            }
        }
        return null;
    }

    function findStepButton() {
        const buttons = document.querySelectorAll('button[x-on\\:click^="takeStep"]');
        for (const btn of buttons) {
            if (!isBtnDisabled(btn) && isVisible(btn)) {
                return btn;
            }
        }
        return null;
    }

    /* =============================
       MAIN TURN LOGIC
    ============================= */

    async function turn() {
        const path = window.location.pathname;

        // Add a random delay to seem more human-like before each action calculation
        await randomSleep();

        // 1. Attack Page Logic (/npcs/attack/...)
        if (path.includes('/npcs/attack/')) {
            const attackBtn = findAttackPageAttackButton();
            if (attackBtn) {
                attackBtn.click();
                return;
            }

            const leaveBtn = findAttackPageLeaveButton();
            if (leaveBtn) {
                leaveBtn.click();
                return;
            }
            return; // Stay here if nothing is ready yet
        }

        // 2. Travel Page Logic (/travel)
        if (path.includes('/travel')) {

            // PRIORITY 1: Check travel attack popups
            const travelAttackBtn = findTravelAttackButton();
            if (travelAttackBtn) {
                travelAttackBtn.click();
                return;
            }

            // PRIORITY 2: Gather inside modal
            const modalGatherBtn = findGatherModalButton();
            if (modalGatherBtn) {
                modalGatherBtn.click();
                return;
            }

            // PRIORITY 3: Open gathering modal
            const gatherStartBtn = findGatherStartButton();
            if (gatherStartBtn) {
                gatherStartBtn.click();
                return;
            }

            // PRIORITY 4: Take a Step
            const stepBtn = findStepButton();
            if (stepBtn) {
                stepBtn.click();
                return;
            }
        }
    }

    // Run the main loop iteratively
    setInterval(turn, TURN_INTERVAL);
})();
