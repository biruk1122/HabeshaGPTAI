function Message(message) {
  return (
    <div>
      {message.role ==="user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          </div>
      ) : (
        <div className="flex items-start justify-start my-4 gap-2">
          </div>
      )}
    </div>
  )
}

export default Message
