from flask import Flask, render_template, redirect, url_for, request, session, jsonify
import random

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

WINNER_QUOTES = [
    "🏆 Victory is yours! You played like a grandmaster.",
    "👑 Champion! Your moves were flawless.",
    "🎉 Victory is sweet. You earned it.",
    "🔥 You outplayed your opponent brilliantly.",
    "🚀 Your tactics were unstoppable!",
    "🦾 You checkmated with style.",
    "🦁 Unbeatable! A chess master in the making.",
    "🎖️ You are the king of the board!",
    "🧠 Your mind is your weapon. Well done!",
    "🙌 You ruled the game from start to finish.",
]
RUNNER_QUOTES = [
    "💪 Defeat teaches more than victory. Well played!",
    "📈 Every loss is a step to mastery.",
    "🧗‍♂️ You fought bravely. Try again!",
    "🫡 Checkmated, but never defeated in spirit.",
    "🏋️ Every grandmaster was once a beginner.",
    "🦾 You showed great courage on the board.",
    "🎯 Your effort was inspiring. Play again soon!",
    "📚 Losing is learning. Keep going!",
    "🕰️ Your best game is yet to come.",
    "⚡ Don't quit. Come back stronger!",
]

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        p1 = request.form.get('player1', '').strip()
        p2 = request.form.get('player2', '').strip()
        if not p1 or not p2:
            return render_template('index.html', error="Please enter both player names.")
        session['p1'] = p1
        session['p2'] = p2
        return redirect(url_for('game'))
    return render_template('index.html', error=None)

@app.route('/game')
def game():
    p1 = session.get('p1', 'Player 1')
    p2 = session.get('p2', 'Player 2')
    return render_template('game.html', p1=p1, p2=p2)

@app.route('/quote', methods=['POST'])
def quote():
    data = request.json
    result = data.get('result', '')
    if result == 'winner':
        quote = random.choice(WINNER_QUOTES)
        return jsonify({'result': 'winner', 'quote': quote})
    else:
        quote = random.choice(RUNNER_QUOTES)
        return jsonify({'result': 'runner', 'quote': quote})

if __name__ == '__main__':
    app.run(debug=True)