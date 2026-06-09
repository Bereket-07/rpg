import Link from "next/link";

export function FeaturedArticles() {
  return (
    <section className="py-24 bg-[#FDF8F5]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Top Spanning Card: Role of IQ */}
          <div className="md:col-span-3 rounded-2xl overflow-hidden relative bg-[#7ebac8] h-[300px] flex items-center shadow-md group">
            {/* Using an abstract psychology image as a stand-in for the custom illustration */}
            <div className="absolute inset-0 flex justify-end">
                <img 
                    src="https://images.unsplash.com/photo-1551001646-f947d159a6d8?q=80&w=1000&auto=format&fit=crop" 
                    alt="Intelligence abstract" 
                    className="h-full w-1/2 object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                />
            </div>
            
            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
              <h3 className="text-white text-3xl md:text-4xl font-serif font-medium mb-4 tracking-tight">
                Role of IQ in relationships
              </h3>
              <p className="text-white/90 text-sm leading-relaxed max-w-md">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna.
              </p>
            </div>
            <Link href="/blog" className="absolute inset-0 z-20"><span className="sr-only">Read article</span></Link>
          </div>

          {/* Bottom Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3 items-start">
            
            {/* Card 1: Dogs for therapy */}
            <div className="rounded-2xl overflow-hidden relative h-[400px] shadow-md group">
              <img 
                src="https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800&auto=format&fit=crop" 
                alt="Therapy dog" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <h4 className="text-white text-2xl font-serif font-medium mb-3">Dogs for therapy</h4>
                <div className="w-16 h-[1px] bg-white/70 mb-3" />
                <p className="text-white/80 text-xs leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
                </p>
              </div>
              <Link href="/blog" className="absolute inset-0 z-20"><span className="sr-only">Read article</span></Link>
            </div>

            {/* Card 2: Fitness & Mental Health */}
            <div className="rounded-2xl overflow-hidden relative h-[400px] shadow-md group">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" 
                alt="Runner" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <h4 className="text-white text-2xl font-serif font-medium mb-3">Fitness & Mental Health</h4>
                <div className="w-16 h-[1px] bg-white/70 mb-3" />
                <p className="text-white/80 text-xs leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
                </p>
              </div>
              <Link href="/blog" className="absolute inset-0 z-20"><span className="sr-only">Read article</span></Link>
            </div>

            {/* Card 3: Leave the past where it belongs (Taller) */}
            <div className="rounded-2xl overflow-hidden relative h-[500px] shadow-md group">
              <img 
                src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop" 
                alt="Car mirror reflecting sunset" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                <h4 className="text-white text-2xl font-serif font-medium mb-4">Leave the past where it belongs</h4>
                <div className="w-20 h-[1px] bg-white/70 mb-4" />
                <p className="text-white/80 text-xs leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                </p>
              </div>
              <Link href="/blog" className="absolute inset-0 z-20"><span className="sr-only">Read article</span></Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
