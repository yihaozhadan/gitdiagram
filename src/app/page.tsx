import MainCard from "~/components/main-card";
import Hero from "~/components/hero";

export default function HomePage() {
  return (
    <main className="flex-grow px-8 pb-8 md:p-8 bg-background">
      <div className="mx-auto mb-4 max-w-4xl lg:my-8">
        <Hero />
        <div className="mt-12"></div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-foreground">
          Turn any GitHub repository into an interactive diagram for
          visualization.
        </p>
        <p className="mx-auto mt-0 max-w-2xl text-center text-lg text-foreground">
          This is useful for quickly visualizing projects.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-foreground">
          You can use your own AI model to generate diagrams or use my AI service.
        </p>
      </div>
      <div className="mb-16 flex justify-center lg:mb-0">
        <MainCard />
      </div>
    </main>
  );
}
