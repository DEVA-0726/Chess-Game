const PIECES = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙', '': ''
};

let board, currentPlayer, selected, gameOver, popupActive, checkStatus;

function initialState() {
    board = [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ];
    currentPlayer = 'white';
    selected = null;
    gameOver = false;
    popupActive = false;
    checkStatus = {white: false, black: false};
}
initialState();

function onBoard(r, c) { return r>=0 && r<8 && c>=0 && c<8; }
function isPlayerPiece(piece) {
    return (currentPlayer === 'white' && piece === piece.toUpperCase() && piece !== '') ||
           (currentPlayer === 'black' && piece === piece.toLowerCase() && piece !== '');
}
function isPlayerPieceColor(piece, color) {
    return (color === 'white' && piece === piece.toUpperCase() && piece !== '') ||
           (color === 'black' && piece === piece.toLowerCase() && piece !== '');
}
function isOpponentPiece(piece, color) {
    if (!piece) return false;
    return (color === 'white' && piece === piece.toLowerCase()) ||
           (color === 'black' && piece === piece.toUpperCase());
}
function pseudoLegalMoves(row, col, colorOverride) {
    let moves = [];
    let piece = board[row][col];
    if (!piece) return moves;
    let color = colorOverride || (piece === piece.toUpperCase() ? 'white' : 'black');
    let directions = [];
    switch (piece.toLowerCase()) {
        case 'p':
            let dir = color === 'white' ? -1 : 1;
            for (let dx of [-1, 1]) {
                let nr = row + dir, nc = col + dx;
                if (onBoard(nr, nc) && board[nr][nc] && isOpponentPiece(board[nr][nc], color)) {
                    moves.push([nr, nc]);
                }
            }
            break;
        case 'n':
            for (let [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
                let nr = row + dr, nc = col + dc;
                if (onBoard(nr, nc) && !isPlayerPiece(board[nr][nc])) {
                    moves.push([nr, nc]);
                }
            }
            break;
        case 'b':
            directions = [[-1,-1],[-1,1],[1,-1],[1,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'r':
            directions = [[-1,0],[1,0],[0,-1],[0,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'q':
            directions = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'k':
            for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
                if (dr===0 && dc===0) continue;
                let nr = row + dr, nc = col + dc;
                if (onBoard(nr, nc) && !isPlayerPiece(board[nr][nc])) {
                    moves.push([nr, nc]);
                }
            }
            break;
    }
    return moves;
}
function slideMoves(row, col, dirs, color) {
    let moves = [];
    for (let [dr, dc] of dirs) {
        for (let mul=1; mul<8; mul++) {
            let nr = row + dr*mul, nc = col + dc*mul;
            if (!onBoard(nr, nc)) break;
            if (!board[nr][nc]) {
                moves.push([nr, nc]);
            } else if (isOpponentPiece(board[nr][nc], color)) {
                moves.push([nr, nc]);
                break;
            } else break;
        }
    }
    return moves;
}
function getKingPos(color) {
    const king = color === 'white' ? 'K' : 'k';
    for (let r=0; r<8; r++) for (let c=0; c<8; c++) if (board[r][c] === king) return [r, c];
    return null;
}
function isKingAttacked(color) {
    let [kr, kc] = getKingPos(color) || [-1,-1];
    let opp = color === 'white' ? 'black' : 'white';
    for (let r=0; r<8; r++) for (let c=0; c<8; c++) {
        if (board[r][c] && isPlayerPieceColor(board[r][c], opp)) {
            let moves = pseudoLegalMoves(r, c, opp);
            if (moves.some(([r2, c2]) => r2 === kr && c2 === kc)) return true;
        }
    }
    return false;
}
function legalMoves(row, col) {
    let moves = [];
    let piece = board[row][col];
    if (!piece) return moves;
    let color = piece === piece.toUpperCase() ? 'white' : 'black';
    let directions = [];
    switch (piece.toLowerCase()) {
        case 'p':
            let dir = color === 'white' ? -1 : 1;
            let startRow = color === 'white' ? 6 : 1;
            if (onBoard(row + dir, col) && !board[row + dir][col]) moves.push([row + dir, col]);
            if (row === startRow && !board[row + dir][col] && !board[row + 2 * dir][col])
                moves.push([row + 2 * dir, col]);
            for (let dx of [-1, 1]) {
                let nr = row + dir, nc = col + dx;
                if (onBoard(nr, nc) && board[nr][nc] && isOpponentPiece(board[nr][nc], color)) {
                    moves.push([nr, nc]);
                }
            }
            break;
        case 'n':
            for (let [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
                let nr = row + dr, nc = col + dc;
                if (onBoard(nr, nc) && !isPlayerPiece(board[nr][nc])) {
                    moves.push([nr, nc]);
                }
            }
            break;
        case 'b':
            directions = [[-1,-1],[-1,1],[1,-1],[1,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'r':
            directions = [[-1,0],[1,0],[0,-1],[0,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'q':
            directions = [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
            moves = moves.concat(slideMoves(row, col, directions, color));
            break;
        case 'k':
            for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
                if (dr===0 && dc===0) continue;
                let nr = row + dr, nc = col + dc;
                if (onBoard(nr, nc) && !isPlayerPiece(board[nr][nc])) {
                    moves.push([nr, nc]);
                }
            }
            break;
    }
    let goodMoves = [];
    for (let [r2, c2] of moves) {
        let backup = board[r2][c2];
        let backupFrom = board[row][col];
        board[r2][c2] = board[row][col];
        board[row][col] = '';
        let safe = !isKingAttacked(color);
        board[row][col] = backupFrom;
        board[r2][c2] = backup;
        if (safe) goodMoves.push([r2, c2]);
    }
    return goodMoves;
}

function drawBoard() {
    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    let whiteCheck = checkStatus && checkStatus.white;
    let blackCheck = checkStatus && checkStatus.black;
    let whiteKingPos = getKingPos('white');
    let blackKingPos = getKingPos('black');
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            let piece = board[row][col];
            if(piece) {
                let span = document.createElement('span');
                span.textContent = PIECES[piece];
                span.className = piece === piece.toUpperCase() ? "piece-white" : "piece-black";
                square.appendChild(span);
            }
            if (selected && selected.row === row && selected.col === col) {
                square.classList.add('selected');
            }
            if (
                (whiteCheck && whiteKingPos && row === whiteKingPos[0] && col === whiteKingPos[1]) ||
                (blackCheck && blackKingPos && row === blackKingPos[0] && col === blackKingPos[1])
            ) {
                square.classList.add('king-in-check');
            }
            square.onclick = () => handleSquareClick(row, col, square);
            boardDiv.appendChild(square);
        }
    }
}
function handleSquareClick(row, col) {
    if (gameOver) return;
    if (popupActive) { hideAllPopups(); return; }
    let piece = board[row][col];
    if (!selected && piece && isPlayerPiece(piece)) {
        let moves = legalMoves(row, col);
        if (moves.length > 0) {
            selected = {row, col};
            highlightMoves(moves);
        }
    } else if (selected) {
        let from = selected;
        let to = {row, col};
        let moves = legalMoves(from.row, from.col);
        if (moves.some(([r, c]) => r === row && c === col)) {
            makeMove(from, to);
            selected = null;
            drawBoard();
        } else {
            selected = null;
            drawBoard();
        }
    }
}
function highlightMoves(moves) {
    drawBoard();
    for (let [r, c] of moves) {
        let idx = r * 8 + c;
        let square = document.getElementById('game-board').children[idx];
        if (square) {
            let dot = document.createElement('div');
            dot.className = 'move-dot';
            square.appendChild(dot);
            square.classList.add('possible-move');
        }
    }
}
function makeMove(from, to) {
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = '';
    if (board[to.row][to.col].toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
        board[to.row][to.col] = (currentPlayer === 'white') ? 'Q' : 'q';
    }
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
    checkForCheck();
    checkGameEnd();
}
function checkGameEnd() {
    let color = currentPlayer;
    let hasLegal = false;
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
        if (board[r][c] && isPlayerPieceColor(board[r][c], color)) {
            if (legalMoves(r, c).length > 0) hasLegal = true;
        }
    }
    if (!hasLegal) {
        // color is the checkmated player
        // winner is the OPPONENT, runner is checkmated player
        let winnerPlayerNum = (color === 'white') ? 2 : 1;
        let runnerPlayerNum = (color === 'white') ? 1 : 2;
        showGameOver(winnerPlayerNum, runnerPlayerNum, "checkmate");
        gameOver = true;
    }
}
function dropMatchByPlayer(playerNum) {
    if (gameOver || popupActive) return;
    // The dropper is runner, the other is winner
    let winnerPlayerNum = playerNum === 1 ? 2 : 1;
    let runnerPlayerNum = playerNum;
    showGameOver(winnerPlayerNum, runnerPlayerNum, "drop");
    gameOver = true;
}
function checkForCheck() {
    let whiteCheck = isKingAttacked('white');
    let blackCheck = isKingAttacked('black');
    checkStatus.white = whiteCheck;
    checkStatus.black = blackCheck;
    showCheckPopupIfNeeded();
}
function showCheckPopupIfNeeded() {
    document.getElementById('popup-left').innerHTML = '';
    document.getElementById('popup-right').innerHTML = '';
    let showL = false, showR = false;
    if (checkStatus.white) showL = true;
    if (checkStatus.black) showR = true;
    if (showL) showCheckPopup('left');
    if (showR) showCheckPopup('right');
}
function showCheckPopup(side) {
    let el = document.getElementById(side === 'left' ? 'popup-left' : 'popup-right');
    el.innerHTML = `<div class="popup-check"><span class="popup-heading">Check</span><div class="popup-body">⚠️ <br>Your King is in danger!<br>You are in check!</div></div>`;
    el.style.display = "block";
    setTimeout(() => {
        el.innerHTML = '';
        el.style.display = "none";
    }, 10000); // 10 seconds
}
function hideAllPopups() {
    document.getElementById('popup-left').innerHTML = '';
    document.getElementById('popup-left').style.display = "none";
    document.getElementById('popup-right').innerHTML = '';
    document.getElementById('popup-right').style.display = "none";
    popupActive = false;
    setTimeout(() => {
        initialState();
        drawBoard();
    }, 100);
}
function showPopup(side, type, html) {
    popupActive = true;
    let popup = document.getElementById(side === 'left' ? 'popup-left' : 'popup-right');
    popup.innerHTML = `<div class="popup-${type}"><span class="popup-heading">${type === "winner" ? "Winner" : type === "runner" ? "Runner" : "Check"}</span><div class="popup-body">${html}</div></div>`;
    popup.style.display = "block";
    function dismissHandler() {
        hideAllPopups();
        document.body.removeEventListener("click", dismissHandler);
    }
    setTimeout(() => {
        document.body.addEventListener("click", dismissHandler);
    }, 250);
}
function showGameOver(winnerPlayerNum, runnerPlayerNum, reason) {
    let winnerSide = winnerPlayerNum === 1 ? "left" : "right";
    let runnerSide = runnerPlayerNum === 1 ? "left" : "right";
    let winnerName = winnerPlayerNum === 1 ? window.PLAYER1 : window.PLAYER2;
    let runnerName = runnerPlayerNum === 1 ? window.PLAYER1 : window.PLAYER2;
    fetch('/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: 'winner' })
    })
    .then(res => res.json())
    .then(data => {
        showPopup(winnerSide, 'winner', `<span style="font-size:2.2em">🏆</span><br>${winnerName} is the WINNER!<br><br>${data.quote}`);
        fetch('/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: 'runner' })
        }).then(res2 => res2.json()).then(rdata => {
            let reasonText = (reason === "drop")
                ? "You dropped the match."
                : "You were checkmated!";
            showPopup(runnerSide, 'runner', `<span style="font-size:2.2em">🙁</span><br>${runnerName}, ${reasonText}<br><br>${rdata.quote}`);
        });
    });
}
function resetGame() {
    initialState();
    hideAllPopups();
    drawBoard();
}
window.onload = () => {
    drawBoard();
};