"use client";
import { FaceFrownIcon, ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex flex-col items-center mb-8">
          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-6 shadow-lg mb-4">
            <FaceFrownIcon className="w-16 h-16 text-blue-600" />
          </span>
          <h1 className="text-6xl font-extrabold text-blue-800 mb-2 tracking-tight">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4">Página não encontrada</h2>
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            Ops! A página que você procura não existe ou foi movida.<br />
            Verifique o endereço ou volte para o início.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Ir para Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-blue-300 text-blue-700 font-semibold hover:bg-blue-50 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Voltar
          </button>
        </div>
        <div className="mt-10 text-xs text-gray-400">
          SOFTMARE &mdash; Sistema Acadêmico FATEC Itapira
        </div>
      </div>
    </div>
  );
}
