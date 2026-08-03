import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>
          Transforme os elogios que seus clientes mandam no WhatsApp em posts
          prontos pra postar no Instagram — sem designer, sem site.
        </p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Bem-vindo</h2>
          <p>
            Entre com seu e-mail pra acessar o painel do seu negócio e
            aprovar os depoimentos recebidos.
          </p>
          <Link href="/login">
            <button className="primary">Entrar</button>
          </Link>
          <p style={{ fontSize: 13, marginTop: 14, textAlign: "center" }}>
            Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
          </p>
        </div>
      </main>
    </>
  );
}
