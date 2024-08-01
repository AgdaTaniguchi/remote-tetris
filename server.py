from flask import Flask, render_template
from flask_socketio import SocketIO, emit, disconnect
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

player_count = 0

@app.route('/display')
def display():
    return render_template('display.html')

@app.route('/controller')
def control():
    return render_template('controller.html')

@socketio.on('connect')
def connect_handler():
    global player_count
    player_count += 0

@socketio.on('disconnect')
def disconnect_handler():
    return

@socketio.on('command')
def command_handler(command):
    print(command)
    emit('sendMessageDisplay', command, broadcast=True)
    # if command['type'] == 'connected':
        # emit('sendMessageDisplay', {'nick': command['nick'],  'status': 'connected'}, broadcast=True)
    # elif command['type'] == 'movement':
    #     emit('sendMessageDisplay', {'nick': command['nick'], 'movement': command['movement']}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8765, debug=True)
