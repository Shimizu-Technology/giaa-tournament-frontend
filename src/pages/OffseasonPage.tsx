import { CalendarClock, CheckCircle2, ExternalLink, Mail, Trophy } from 'lucide-react';

export function OffseasonPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="text-center">
          <img
            src="/images/giaa-logo.png"
            alt="A.B. Won Pat International Airport Guam"
            className="mx-auto h-24 w-auto sm:h-32"
          />
        </header>

        <section className="my-auto py-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={17} />
            2026 tournament concluded
          </div>

          <div className="mx-auto mb-7 flex w-fit items-center gap-3">
            <img src="/images/pete-silhouette.png" alt="" className="h-16 w-auto sm:h-20" aria-hidden="true" />
            <div className="text-left">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a227]">Edward A.P. Muna II</p>
              <p className="text-lg font-bold text-[#1e3a5f] sm:text-2xl">Memorial Golf Tournament</p>
            </div>
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[#1e3a5f] sm:text-5xl lg:text-6xl">
            Thank you for a memorable Airport Week tournament.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            The January 9, 2026 tournament has concluded and registration is closed. We appreciate every golfer, sponsor, volunteer, and partner who helped make the event possible.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <Trophy className="mx-auto text-[#c9a227]" />
              <h2 className="mt-3 font-bold text-[#1e3a5f]">Event complete</h2>
              <p className="mt-1 text-sm text-slate-600">The 5th annual tournament wrapped up successfully.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <CalendarClock className="mx-auto text-[#1e3a5f]" />
              <h2 className="mt-3 font-bold text-[#1e3a5f]">Next date TBA</h2>
              <p className="mt-1 text-sm text-slate-600">Future tournament details will be announced when confirmed.</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <Mail className="mx-auto text-emerald-700" />
              <h2 className="mt-3 font-bold text-[#1e3a5f]">Stay informed</h2>
              <p className="mt-1 text-sm text-slate-600">Contact the tournament team for future-event updates.</p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="https://www.guamairport.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#2c5282] sm:w-auto"
            >
              <ExternalLink size={18} /> Visit the airport website
            </a>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          Built by <a href="https://shimizu-technology.com" className="font-semibold text-[#1e3a5f] hover:underline">Shimizu Technology</a>
        </footer>
      </div>
    </main>
  );
}
