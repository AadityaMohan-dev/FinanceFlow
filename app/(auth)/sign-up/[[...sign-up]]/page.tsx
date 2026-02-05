import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2.5 rounded-xl">
            <span className="text-xl">💰</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            FinanceFlow
          </span>
        </div>
      </div>
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-zinc-900 border border-zinc-800 shadow-2xl',
          }
        }}
      />
    </div>
  )
}