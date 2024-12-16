import GHForm from "~/components/gh-form";
import Hero from "~/components/hero";

export default function HomePage() {
  return (
    <main className="flex-grow">
      <div className="mx-auto my-12 max-w-4xl">
        <Hero />
        <p className="mx-auto mt-8 max-w-2xl text-center text-lg">
          Turn any GitHub repository into an interactive diagram for
          visualization.
        </p>
        <p className="mx-auto mt-0 max-w-2xl text-center text-lg">
          This is useful for quickly understanding projects.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg">
          You can also replace &apos;hub&apos; with &apos;diagram&apos; in any
          Github URL
        </p>
      </div>
      <div className="flex justify-center">
        <GHForm />
      </div>
    </main>
  );
}
