export default function TopBar() {
  return (
    <>
      <div className="box-border border-1 p-4 rounded-lg w-full max-w-5xl flex items-center justify-between">
        <div className="">Round <span id="round-number">0</span> out of <span id="round-total">3</span></div>
        <div id="room-code">67SIGM@</div>
        <div>Time left <span id="time">0</span></div>
      </div>
    </>
  )
}