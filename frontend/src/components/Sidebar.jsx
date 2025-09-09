import { useState } from "react"
import { useAppContext } from "../contexts/AppContext"
import { assets } from "../assets/assets"

function Sidebar() {
  const { chats, setSelectedChats, theme, setTheme, user } = useAppContext()
  const [search, setSearch] = useState("")

  return (
    <div
      className="flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl
    transition-all duration-500 max-md:absolute left-0 z-1"
    >
      {/*Logo*/}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="Logo Image"
        className="h-[50px] w-[200px]"
      />
      {/*New chat button */}
      <button
        className="flex justify-center item-center w-full py-2 mt-6
      text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span>New Chat
      </button>

      {/*search conversation */}
      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-400
      dark:border-white/20 rounded-md"
      >
        <img
          src={assets.search_icon}
          className="w-4 not-dark:invert"
          alt="Search Icon Image"
        />
        <input
          type="text"
          placeholder="Search Conversations"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className="text-xs placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div
              key={chat._id}
              className="p-2 px-4 dark:bg-[#57317c]/10 border
            border-gray-300 dark:border-[#80609f]/15 rounded-md cursor-pointer
            flex justify-between group"
            >
              <div>
                <p className="truncate w-full">
                  {}
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text[#b1a6c0]">
                  {chat.updatedAt}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
                alt="Delete Icon Image"
              />
            </div>
          ))}
      </div>
    </div>
  )
}

export default Sidebar
