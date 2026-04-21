import surveyor from "@/assets/ranola-building.jpeg";
import teamRam from "@/assets/team-ram.png";
import teamRacel from "@/assets/team-racel.png";
import { FacebookCTA } from "@/components/site/FacebookCTA";

const About = () => {
  return (
    <>
      <section className="container pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">About</div>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05] mb-6 text-balance">
            Local roots, careful work.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Rañola Surveying Services is a Geodetic Engineering practice based in Mobo, Masbate.
            We've spent years walking the rice paddies, coastlines, and town lots of this province —
            and we treat every parcel like it matters.
          </p>
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-deep order-2 md:order-1">
          <img src={surveyor} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="order-1 md:order-2 space-y-5 text-muted-foreground leading-relaxed">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground">Our approach</h2>
          <p>
            Surveys are part field work, part paperwork. We're comfortable in both — measuring with
            modern instruments, then walking your file through DENR, LRA, CENRO, and barangay
            offices until everything is in order.
          </p>
          <p>
            We keep our clients informed at every stage. No vague timelines, no hidden steps. If
            something blocks your application, we tell you what it is and what it takes to clear it.
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground pt-4">Our promise</h2>
          <p>
            Every plan we release is signed and sealed by a licensed Geodetic Engineer. The
            measurements are honest, the documents are complete, and the work holds up to scrutiny.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-24 border-t border-border">
        <div className="max-w-2xl mb-12 md:mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Leadership</div>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-[1.1] text-balance">
            Meet the engineer behind every plan.
          </h2>
        </div>
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <figure className="md:col-span-5 max-w-xs sm:max-w-sm md:max-w-none mx-auto w-full">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-secondary shadow-deep">
              <img
                src={teamRacel}
                alt="Racel Claire A. Rañola"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </figure>
          <div className="md:col-span-7 space-y-5">
            <div className="text-xs uppercase tracking-[0.25em] text-primary">Owner · Geodetic Engineer</div>
            <h3 className="font-serif text-3xl md:text-4xl text-foreground leading-tight text-balance">
              Racel Claire A. Rañola
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              A licensed Geodetic Engineer and the owner of Rañola Surveying Services. Every plan we
              release passes through her hands — signed, sealed, and held to the standard our clients
              have come to trust.
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-16 md:pb-24">
        <div className="max-w-2xl mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">The team</div>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-tight text-balance">
            Working alongside Engr. Rañola.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-10 md:gap-12 max-w-2xl">
          <figure className="space-y-4">
            <div className="relative aspect-square rounded-sm overflow-hidden bg-secondary">
              <img
                src={teamRam}
                alt="Ram Cedrick A. Rañola"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption>
              <h3 className="font-serif text-lg text-foreground">Ram Cedrick A. Rañola</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1.5">
                Facebook Admin Manager · Secretary
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="container py-16 text-center">
        <h2 className="font-serif text-3xl md:text-4xl mb-6 text-balance">Talk to us about your land.</h2>
        <FacebookCTA />
      </section>
    </>
  );
};

export default About;
