from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

player_count = 0

@app.route('/display')
def display():
    return render_template('display.html')

@app.route('/controls')
def control():
    return render_template('controls.html')

@socketio.on('connect')
def connect_handler(jogador):
    from time import time
    print(jogador)
    global player_count
    player_count += 0
    id = int(time())
    emit('connected', id)

@socketio.on('disconnect')
def disconnect_handler():
    print('client disconnected')

@socketio.on('command')
def command_handler(command):
    print(command)
    emit('getMessage', command)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8765, debug=True)
