import DialectTranslator from '@/components/dialect-translator';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="font-headline text-2xl md:text-3xl font-semibold text-primary flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-accent"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M13 8H7" />
            <path d="M17 12H7" />
          </svg>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bhasha Boli
          </span>
        </h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid w-full max-w-7xl gap-2">
          <p className="text-muted-foreground">
            Your personal AI Malayalam dialect converter. Translate any Manglish
            sentence into the unique slangs of all 14 Kerala districts.
          </p>
        </div>
        <DialectTranslator />
      </main>
    </div>
  );
}
