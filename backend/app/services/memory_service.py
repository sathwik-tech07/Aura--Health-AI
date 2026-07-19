conversation_memory = {}


def get_history(session_id):
    return conversation_memory.get(session_id, [])


def add_message(session_id, role, message):
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []

    conversation_memory[session_id].append({
        "role": role,
        "message": message
    })


def clear_history(session_id):
    if session_id in conversation_memory:
        del conversation_memory[session_id] 