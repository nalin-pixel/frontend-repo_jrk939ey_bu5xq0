import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [loading, setLoading] = useState(true)
  const [destinations, setDestinations] = useState([])
  const [packages, setPackages] = useState([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', package_title: '', destination_slug: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        // Try seeding sample data (safe to call multiple times)
        await fetch(`${baseUrl}/seed`, { method: 'POST' }).catch(() => {})
      } catch {}
      await Promise.all([loadDestinations(), loadPackages()])
      setLoading(false)
    }
    init()
  }, [])

  const loadDestinations = async () => {
    try {
      const res = await fetch(`${baseUrl}/destinations`)
      const data = await res.json()
      setDestinations(data)
    } catch (e) {
      console.error(e)
    }
  }
  const loadPackages = async (slug) => {
    try {
      const q = slug ? `?destination=${encodeURIComponent(slug)}` : ''
      const res = await fetch(`${baseUrl}/packages${q}`)
      const data = await res.json()
      setPackages(data)
    } catch (e) {
      console.error(e)
    }
  }

  const onSelectDestination = async (slug) => {
    setSelectedSlug(slug)
    setForm((f) => ({ ...f, destination_slug: slug }))
    await loadPackages(slug || undefined)
  }

  const submitInquiry = async (e) => {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const res = await fetch(`${baseUrl}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send inquiry')
      setStatus('Thanks! We will contact you shortly.')
      setForm({ name: '', email: '', phone: '', message: '', package_title: '', destination_slug: selectedSlug || '' })
    } catch (e) {
      setStatus('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 inline-block" />
            <span className="font-extrabold text-xl">WanderWorld Tours</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm">
            <a href="#destinations" className="hover:text-blue-600">Destinations</a>
            <a href="#packages" className="hover:text-blue-600">Packages</a>
            <a href="#inquiry" className="hover:text-blue-600">Inquiry</a>
          </nav>
          <a href="#inquiry" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Get a Quote</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=1800&auto=format&fit=crop"
            alt="Travel"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
              Discover Dubai, Thailand and beyond
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Curated experiences, flexible itineraries, and unbeatable prices. Your next adventure starts here.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#packages" className="px-5 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Explore Packages</a>
              <a href="#inquiry" className="px-5 py-3 rounded-md bg-white/80 border border-gray-200 hover:bg-white">Plan My Trip</a>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Top Destinations</h2>
            <p className="text-gray-600 mt-2">Handpicked places our travelers love</p>
          </div>
          <button
            onClick={() => { loadDestinations(); loadPackages(selectedSlug || undefined) }}
            className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
          >Refresh</button>
        </div>
        {loading ? (
          <p>Loading destinations...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <button
                key={d._id}
                onClick={() => onSelectDestination(selectedSlug === d.slug ? '' : d.slug)}
                className={`group relative overflow-hidden rounded-xl border shadow-sm text-left ${selectedSlug === d.slug ? 'ring-2 ring-blue-500' : ''}`}
              >
                <img src={d.image} alt={d.name} className="h-52 w-full object-cover group-hover:scale-105 transition-transform" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{d.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{d.description}</p>
                  {d.highlights?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {d.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{h}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold ${selectedSlug === d.slug ? 'bg-blue-600 text-white' : 'bg-white/90'}`}>{selectedSlug === d.slug ? 'Selected' : 'View'}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Packages */}
      <section id="packages" className="bg-white/60 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">Popular Packages {selectedSlug ? `- ${selectedSlug[0].toUpperCase()+selectedSlug.slice(1)}` : ''}</h2>
              <p className="text-gray-600 mt-2">Transparent pricing. No hidden fees.</p>
            </div>
            <div className="flex gap-3 items-center">
              <select
                value={selectedSlug}
                onChange={(e) => onSelectDestination(e.target.value)}
                className="px-3 py-2 rounded-md border bg-white"
              >
                <option value="">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
              <button onClick={() => loadPackages(selectedSlug || undefined)} className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm">Filter</button>
            </div>
          </div>

          {packages.length === 0 ? (
            <p className="text-gray-600">No packages found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((p) => (
                <div key={p._id} className="rounded-xl overflow-hidden border bg-white shadow-sm flex flex-col">
                  {p.image && <img src={p.image} alt={p.title} className="h-48 w-full object-cover" />}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{p.days} days • {p.destination_slug}</p>
                    {p.includes?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.includes.slice(0, 4).map((i, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{i}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-2xl font-extrabold">${p.price}</div>
                      <button
                        onClick={() => setForm((f) => ({ ...f, package_title: p.title, destination_slug: p.destination_slug }))}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                      >Enquire</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry */}
      <section id="inquiry" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Plan your custom trip</h2>
            <p className="text-gray-600 mt-2">Tell us what you like and we will craft a perfect itinerary for you.</p>
            <ul className="mt-6 space-y-2 text-gray-700">
              <li>• Dedicated travel consultant</li>
              <li>• Flexible dates and custom add-ons</li>
              <li>• Best-rate guarantee</li>
            </ul>
            <div className="mt-8 p-4 rounded-lg border bg-white/70 text-sm">
              <p><span className="font-semibold">Backend:</span> {baseUrl}</p>
            </div>
          </div>

          <form onSubmit={submitInquiry} className="bg-white/80 rounded-xl border shadow-sm p-6 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select value={form.destination_slug} onChange={(e) => setForm({ ...form, destination_slug: e.target.value })} className="px-4 py-3 rounded-md border bg-white">
                <option value="">Destination (optional)</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
              <select value={form.package_title} onChange={(e) => setForm({ ...form, package_title: e.target.value })} className="px-4 py-3 rounded-md border bg-white">
                <option value="">Package (optional)</option>
                {packages.map((p) => (
                  <option key={p._id} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>
            <textarea placeholder="Tell us your travel dates, group size, budget, etc." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            <button type="submit" className="px-5 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">Send Inquiry</button>
            {status && <p className="text-sm text-gray-700">{status}</p>}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/70">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} WanderWorld Tours. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#destinations" className="hover:text-blue-600">Destinations</a>
            <a href="#packages" className="hover:text-blue-600">Packages</a>
            <a href="#inquiry" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
