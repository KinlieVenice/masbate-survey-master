import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Mail, Compass, Ruler, FileText, ScrollText, Pencil, ThumbsUpIcon, HandshakeIcon, Quote, ChevronDown, FileText as FileTextIcon } from "lucide-react";
import heroLand from "@/assets/main.jpg";
import surveyor from "@/assets/ranola-building.jpeg";
import topo from "@/assets/topo-map.jpg";
import { ADDRESS, EMAIL, PHONE, SERVICES } from "@/lib/services";
import { FacebookCTA } from "@/components/site/FacebookCTA";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden -mt-16 md:-mt-20">
        <img
          src={heroLand}
          alt="Land Surveying"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/95" />
        <div className="container relative pb-16 md:pb-28 pt-32">
          <div className="max-w-3xl reveal-up">
            <div className="inline-flex items-center gap-2 mb-6 text-primary-foreground/80 text-xs uppercase tracking-[0.25em]">
              <span className="h-px w-8 bg-primary-foreground/40" />
              Licensed Geodetic Engineering · Mobo, Masbate
            </div>
            <h1 className="font-serif text-primary-foreground text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-balance mb-6">
              The land beneath your feet,<br />
              <span className="italic font-light">measured with care.</span>
            </h1>
            <p className="text-primary-foreground/85 text-base md:text-lg max-w-xl leading-relaxed mb-8">
              Rañola Surveying Services helps Masbate landowners settle boundaries, divide parcels,
              and secure documentation — with the precision modern transactions demand.
            </p>
            <div className="flex flex-wrap gap-4">
              <FacebookCTA variant="light" />
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide text-primary-foreground hover:gap-3 transition-all duration-300"
              >
                Explore services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
          {[
            { k: "6+", v: "Years field experience" },
            { k: "1,500+", v: "Lots surveyed" },
            { k: "9,800+", v: "Hectares surveyed" },
            { k: "10", v: "Survey services" },
            { k: "100%", v: "Licensed & sealed" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-serif text-2xl md:text-3xl text-primary">{s.k}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About / intro */}
      <section className="container py-20 md:py-28 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-deep">
          <img src={surveyor} alt="Total station theodolite in a green field" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Who we are</div>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight mb-6 text-balance">
            A small team that knows the ground —<br />
            <span className="italic font-light text-primary">and the paperwork.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Based in Poblacion 1, Mobo, we work directly with families and businesses across Masbate
            on relocation, subdivision, consolidation, and as-built surveys. We handle field work,
            plan preparation, and the back-and-forth with DENR, LRA, CENRO, and barangay offices so
            you don't have to.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Every plan that leaves our office is signed and sealed by a licensed Geodetic Engineer.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all">
            More about our practice <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">What we do</div>
              <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight max-w-2xl text-balance">
                Surveying services, end to end.
              </h2>
            </div>
            <Link to="/services" className="text-sm text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-sm overflow-hidden shadow-soft">
            {SERVICES.map((s, i) => {
              const Icon = [Compass, Ruler, FileText, ScrollText, Compass, Ruler, Pencil, FileTextIcon, ThumbsUpIcon, HandshakeIcon][i];
              const isLast = i === SERVICES.length - 1;
              const smLeftover = SERVICES.length % 2 === 1;
              const lgLeftover = SERVICES.length % 3;
              const spanClass = cn(
                isLast && smLeftover && "sm:col-span-2",
                isLast && lgLeftover === 1 && "lg:col-span-3",
                isLast && lgLeftover === 2 && "lg:col-span-1 sm:col-span-2 lg:col-start-2",
              );
              return (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className={cn("group bg-card p-7 md:p-9 hover:bg-secondary/40 transition-colors duration-300 ease-natural relative", spanClass)}
                >
                  <Icon className="h-6 w-6 text-primary/70 mb-6" strokeWidth={1.4} />
                  <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">{s.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{s.short}</p>
                  <span className="inline-flex items-center gap-2 text-xs text-primary font-medium uppercase tracking-wider group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container py-20 md:py-28">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">How we work</div>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight mb-14 max-w-2xl text-balance">
          A clear path from inquiry to signed plan.
        </h2>
        <div className="grid md:grid-cols-4 gap-10 md:gap-6">
          {[
            { n: "01", t: "Consultation", d: "Send your documents and concerns over Facebook or phone. We assess scope and quote." },
            { n: "02", t: "Document review", d: "We verify titles, tax declarations, and prior plans before stepping into the field." },
            { n: "03", t: "Field work", d: "Our team measures, marks, and notifies adjoining owners as the survey requires." },
            { n: "04", t: "Plan & filing", d: "Signed and sealed plan delivered, plus help with submission to concerned offices." },
          ].map((p) => (
            <div key={p.n} className="border-t border-primary/30 pt-6">
              <div className="text-xs text-primary/60 tracking-widest mb-3">{p.n}</div>
              <div className="font-serif text-xl text-foreground mb-2">{p.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container py-20 md:py-28">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">What clients say from FB Reviews</div>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight text-balance">
              Trusted by landowners across Masbate.
            </h2>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {[
                {
                  quote: "Sobrang satisfied kami sa relocation survey nila. Akala namin mahirap hanapin ang exact boundary ng lupa namin, pero dahil sa kanilang precise instruments at malinaw na paliwanag, naging smooth lahat.",
                  name: "Gina Ayala",
                  role: "Client - Milagros",
                },
                {
                  quote: "We hired them for a relocation survey and we were amazed by their accuracy. They explained every corner and boundary clearly, which gave us peace of mind.",
                  name: "Yesha Reyes",
                  role: "Client- Balud",
                },
                {
                  quote: "Kung gusto mo ng peace of mind sa lupa, sila na ang piliin — tested and proven sa loob ng limang taon",
                  name: "Aikee Moran",
                  role: "Client - Baleno",
                },
                {
                  quote: "Lubos kaming nasiyahan sa serbisyong ibinigay nila sa pag-relocate ng aming lupa. Tumpak at malinaw ang kanilang sukat at paliwanag.",
                  name: "Jenica Ann Macaraeg",
                  role: "Client - Cataingan",
                },
                {
                  quote: "From relocation to subdivision, lahat ginawa nila nang maayos. Walang stress, walang confusion, at malinaw ang bawat gawa.",
                  name: "Alianna Torecelino",
                  role: "Client – Masbate City",
                },
              ].map((t, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <Card className="h-full bg-card border-border">
                    <CardContent className="p-6 md:p-8 flex flex-col h-full">
                      <Quote className="h-8 w-8 text-primary/40 mb-4" />
                      <p className="text-muted-foreground leading-relaxed flex-grow mb-6">
                        "{t.quote}"
                      </p>
                      <div className="border-t border-border pt-4">
                        <div className="font-medium text-foreground">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-border bg-card hover:bg-secondary" />
            <CarouselNext className="hidden md:flex -right-12 border-border bg-card hover:bg-secondary" />
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={topo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-forest" />
        <div className="container relative py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-primary-foreground text-3xl md:text-5xl leading-tight mb-6 text-balance">
              Ready to talk about your lot?
            </h2>
            <p className="text-primary-foreground/75 leading-relaxed mb-8 max-w-md">
              Send us a message on Facebook / WhatsApp / viber with your documents and questions — we reply the same day.
            </p>
            <FacebookCTA variant="light" />
          </div>
          <div className="space-y-5 text-primary-foreground">
            <div className="flex items-start gap-4 border-t border-primary-foreground/15 pt-5">
              <MapPin className="h-5 w-5 mt-0.5 text-primary-foreground/60" />
              <div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/50 mb-1">Office</div>
                <div className="text-sm">{ADDRESS}</div>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-primary-foreground/15 pt-5">
              <Phone className="h-5 w-5 mt-0.5 text-primary-foreground/60" />
              <a href={`tel:${PHONE}`} className="text-sm hover:underline underline-offset-4">{PHONE}</a>
            </div>
            <div className="flex items-start gap-4 border-t border-primary-foreground/15 pt-5">
              <Mail className="h-5 w-5 mt-0.5 text-primary-foreground/60" />
              <a href={`mailto:${EMAIL}`} className="text-sm hover:underline underline-offset-4">{EMAIL}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
