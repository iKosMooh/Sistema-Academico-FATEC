"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Ícones
const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 5 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 17 22 12z" />
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.402 3.635 1.37c-.967.967-1.24 2.14-1.298 3.417C2.013 5.668 2 6.077 2 9.333v5.334c0 3.256.013 3.665.072 4.945.058 1.277.331 2.45 1.298 3.417.967.967 2.14 1.24 3.417 1.298 1.28.059 1.689.072 4.945.072s3.665-.013 4.945-.072c1.277-.058 2.45-.331 3.417-1.298.967-.967 1.24-2.14 1.298-3.417.059-1.28.072-1.689.072-4.945V9.333c0-3.256-.013-3.665-.072-4.945-.058-1.277-.331-2.45-1.298-3.417-.967-.967-2.14-1.24-3.417-1.298C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.062 19A9 9 0 1 0 12 3v1" />
  </svg>
);

export default function Footer() {
  const router = useRouter();

  const handleReset = () => {
    if (confirm('Esta ação reiniciará todo o sistema. Tem certeza?')) {
      router.push('/pages/admin/sistema/reset');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-blue-900 to-blue-800 text-white w-full px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* 1 - Fatec Itapira */}
          <div>
            <h3 className="font-bold text-xl border-b border-blue-400 pb-2">Fatec Itapira</h3>
            <div className="space-y-2 mt-2">
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                suporte@fatecitapira.edu.br
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                </svg>
                (19) 3863-5210
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                Rua Tereza Lera Paoletti, 570 - Itapira/SP
              </p>
            </div>
          </div>

          {/* 2 - Links Úteis */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b border-blue-400 pb-2">Links Úteis</h3>
            <nav aria-label="Links institucionais">
              <ul className="space-y-3 mt-2">
                <li>
                  <a href="/faq" className="hover:underline flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                    </svg>
                    FAQ - Perguntas Frequentes
                  </a>
                </li>
                <li>
                  <a href="/politica-de-privacidade" className="hover:underline flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="/contato" className="hover:underline flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Contato
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* 3 - Redes Sociais */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b border-blue-400 pb-2">Redes Sociais</h3>
            <div className="space-y-3 mt-2">
              <a
                href="https://facebook.com/fatecitapira"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1.5 text-blue-100 hover:text-white transition-colors"
              >
                <FacebookIcon />
                <span>Facebook</span>
              </a>
              <a
                href="https://instagram.com/fatecdeitapira"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1.5 text-blue-100 hover:text-white transition-colors"
              >
                <InstagramIcon />
                <span>Instagram</span>
              </a>
              <a
                href="https://linkedin.com/school/fatec-itapira"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1.5 text-blue-100 hover:text-white transition-colors"
              >
                <LinkedInIcon />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* 4 - Site Suporte */}
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b border-blue-400 pb-2">Site Suporte</h3>
            <div className="flex flex-col gap-2 mt-2">
              <a href="mailto:caio.magalhaes@gmail.com" className="text-white hover:text-blue-200 underline transition-colors">caio.magalhaes@gmail.com</a>
              <a href="mailto:henrique.cardoso@gmail.com" className="text-white hover:text-blue-200 underline transition-colors">henrique.cardoso@gmail.com</a>
              <a href="mailto:gustavo.ribeiro@gmail.com" className="text-white hover:text-blue-200 underline transition-colors">gustavo.ribeiro@gmail.com</a>
              <a href="mailto:luis.eduardo@gmail.com" className="text-white hover:text-blue-200 underline transition-colors">luis.eduardo@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Sistema Acadêmico - fora do grid, centralizado */}
        <div className="max-w-md mx-auto mb-10">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center bg-blue-800/70 px-4 py-2 rounded-full mb-3">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <p className="font-bold text-lg text-center w-full">Sistema Acadêmico v1.2</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 mt-2 mb-4 text-blue-900 font-bold px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-transparent border border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-yellow-600 hover:text-white"
              >
                <RefreshIcon />
                <span className="text-base">Reset Sistema</span>
              </button>
            </div>
            <p className="text-blue-200 text-sm text-center mb-4">Plataforma oficial da Fatec Itapira</p>
            <h4 className="font-bold text-center mb-3 text-blue-200 border-b border-blue-600 pb-2">
              Equipe de Desenvolvimento
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-300/80 p-2 rounded-lg text-center">
                <p className="font-bold text-blue-900 text-sm">Caio Magalhães</p>
                <p className="text-blue-800 text-xs">FullStack Developer</p>
              </div>
              <div className="bg-blue-300/80 p-2 rounded-lg text-center">
                <p className="font-bold text-blue-900 text-sm">Gustavo Ribeiro</p>
                <p className="text-blue-800 text-xs">FrontEnd Developer</p>
              </div>
              <div className="bg-blue-300/80 p-2 rounded-lg text-center">
                <p className="font-bold text-blue-900 text-sm">Luiz Eduardo</p>
                <p className="text-blue-800 text-xs">FrontEnd Developer</p>
              </div>
              <div className="bg-blue-300/80 p-2 rounded-lg text-center">
                <p className="font-bold text-blue-900 text-sm">Henrique Cardoso</p>
                <p className="text-blue-800 text-xs">FrontEnd Developer</p>
              </div>
            </div>
            {/* Softmare logo centralizada dentro do Sistema Acadêmico */}
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white/20 p-2 rounded-full mb-2">
                <Image
                  src="/logo.png"
                  alt="Logo Softmare"
                  width={50}
                  height={50}
                  className="w-10 h-10 object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Softmare
              </span>
              <p className="text-blue-200 text-xs mt-1 text-center">
                Tecnologia e Inovação Acadêmica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 pt-4 border-t border-blue-700 text-center text-blue-300 text-sm">
        © {new Date().getFullYear()} Fatec Itapira. Todos os direitos reservados.
      </div>
    </footer>
  );
}