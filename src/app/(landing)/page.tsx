import Link from "next/link";
import { CheckCircle2, Bot, ShieldCheck, Palette, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl text-blue-600">
            <span>NexCRM</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Probar 14 Días Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
          Estrategia Product-Led Growth (PLG)
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          El CRM SaaS Multi-Tenant que se adapta a cualquier industria
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          Aislamiento total de datos, personalización de marca blanca y atención automatizada mediante inteligencia artificial por WhatsApp.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition"
          >
            Iniciar Prueba Gratuita (14 Días)
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Aislamiento Total</h3>
          <p className="text-slate-600">
            Aprovisionamiento automático e instantáneo de datos por proyecto para máxima seguridad y privacidad.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Palette className="w-10 h-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Motor White-Label</h3>
          <p className="text-slate-600">
            Personaliza subdominios, logos, favicons y paletas de colores corporativas por cada inquilino.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Bot className="w-10 h-10 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">Bot QR de WhatsApp (IA)</h3>
          <p className="text-slate-600">
            Atención automatizada inteligente integrada con modelos Llama + Groq de ultra-baja latencia.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Planes de Suscripción</h2>
          <p className="text-center text-slate-600 mb-12">
            Comienza con 14 días de prueba total sin compromiso.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Basic */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
                <p className="text-slate-600 text-sm mb-6">Para emprendedores e independientes.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> CRM Completo</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> 1 Usuario</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Pipeline de Ventas</li>
                </ul>
              </div>
              <Link href="/register?plan=basic" className="w-full text-center bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition">
                Probar Plan Basic
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 bg-white shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MÁS POPULAR
              </span>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                <p className="text-slate-600 text-sm mb-6">Para equipos en crecimiento.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Hasta 5 Usuarios</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Bot de IA para WhatsApp</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Motor White-Label</li>
                </ul>
              </div>
              <Link href="/register?plan=pro" className="w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Probar Plan Pro
              </Link>
            </div>

            {/* Plan Enterprise */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
                <p className="text-slate-600 text-sm mb-6">Para empresas consolidadas.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Hasta 10 Usuarios</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Reportes Avanzados & Analytics</li>
                  <li className="flex items-center text-sm"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> Soporte VIP Dedicado</li>
                </ul>
              </div>
              <Link href="/register?plan=enterprise" className="w-full text-center bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition">
                Probar Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}