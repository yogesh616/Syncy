import React from 'react'

function Warn() {
  return (
   <div className=' bg-gray-800' style={{width: "100vw", height: "100vh"}}>
     <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 '>
     
     <div
       className="relative flex w-80 flex-col rounded-xl bg-gradient-to-br from-gray-600 to-yellow-100 bg-clip-border text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
     >
       <div
         className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-clip-border shadow-lg group"
       >
         <div
           className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90"
         ></div>
         <div
           className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"
         ></div>
         <div className="absolute inset-0 flex items-center justify-center">
           <svg
             viewBox="0 0 24 24"
             fill="currentColor"
             className="w-20 h-20 text-white/90 transform transition-transform group-hover:scale-110 duration-300"
           >
             <path
               d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83zM11 16h2v2h-2zm0-6h2v4h-2z"
             ></path>
           </svg>
         </div>
       </div>
       <div className="p-6">
         <h5
           className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-yellow-500 antialiased group-hover:text-blue-600 transition-colors duration-300"
         >
          Warning
         </h5>
         <p
           className="block font-sans text-lg font-semibold leading-relaxed text-gray-50 antialiased"
         >
           This App is Only Built For Mobile Devices
         </p>
       </div>
       <div className="p-6 pt-0 hidden">
         <button
           className="group relative w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
         >
           <span className="relative flex items-center gap-2">
             Read More
             <svg
               viewBox="0 0 24 24"
               stroke="currentColor"
               fill="none"
               className="w-5 h-5 transform transition-transform group-hover:translate-x-1"
             >
               <path
                 d="M17 8l4 4m0 0l-4 4m4-4H3"
                 strokeWidth="2"
                 strokeLinejoin="round"
                 strokeLinecap="round"
               ></path>
             </svg>
           </span>
         </button>
       </div>
     </div>
     
         </div>
   </div>
  )
}

export default Warn
