import { useState } from "react";
import { supabase } from "../supabaseClient";

function Register({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (password !== confirmarPassword) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    if (password.length < 6) {
      setErro("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    setACarregar(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErro(error.message);
    } else {
      setSucesso(
        "Conta criada! Verifica o teu email para confirmares a conta."
      );
    }

    setACarregar(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">€</div>
          <span>Finanças</span>
        </div>

        <div className="auth-header">
          <h1>Criar conta</h1>
          <p>Cria a tua conta para começares a controlar as tuas despesas.</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="registo-email">Email</label>
            <input
              id="registo-email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="registo-password">Palavra-passe</label>
            <input
              id="registo-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="registo-confirmar-password">
              Confirmar palavra-passe
            </label>
            <input
              id="registo-confirmar-password"
              type="password"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {erro && (
            <div className="auth-error" role="alert">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="auth-success" role="status">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={aCarregar}
          >
            {aCarregar
              ? "A criar conta..."
              : "Criar conta"}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-footer">
          Já tens uma conta?
          <button
            type="button"
            onClick={onLogin}
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;