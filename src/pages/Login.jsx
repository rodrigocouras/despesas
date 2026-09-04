import { useState } from "react";
import { supabase } from "../supabaseClient";

function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErro("");
    setACarregar(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro("Email ou palavra-passe incorretos.");
    }

    setACarregar(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
      </div>

      <div className="auth-card">

        {/* LOGO */}
        <div className="auth-brand">
          <div className="auth-logo">
            €
          </div>

          <span>Finanças</span>
        </div>

        {/* TÍTULO */}
        <div className="auth-header">
          <h1>Bem-vindo de volta</h1>

          <p>
            Entra na tua conta para continuares
            a controlar as tuas despesas.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <div className="input-wrapper">
              <span className="input-icon">
                @
              </span>

              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Palavra-passe</label>

              <button
                type="button"
                className="forgot-password"
              >
                Esqueceste-te?
              </button>
            </div>

            <div className="input-wrapper">
              <span className="input-icon">
                •
              </span>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {erro && (
            <div className="auth-error">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={aCarregar}
          >
            {aCarregar
              ? "A entrar..."
              : "Entrar na conta"}

            {!aCarregar && (
              <span className="button-arrow">
                →
              </span>
            )}
          </button>

        </form>

        {/* REGISTO */}
        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-footer">
          Ainda não tens uma conta?

          <button
            type="button"
            onClick={onRegister}
          >
            Criar conta
          </button>
        </p>

      </div>

      <div className="auth-copyright">
        Controlo de despesas · Gestão financeira pessoal
      </div>

    </div>
  );
}

export default Login;