import { useState } from "react";
import { supabase } from "../supabaseClient";

function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aCarregar, setACarregar] = useState(false);
  const [aRecuperar, setARecuperar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");
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

  const handlePasswordRecovery = async () => {
    setErro("");
    setSucesso("");

    if (!email.trim()) {
      setErro("Introduz o teu email para receberes o link de recuperação.");
      return;
    }

    setARecuperar(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) {
      setErro(error.message);
    } else {
      setSucesso(
        "Se existir uma conta associada a este email, receberás um link para redefinir a palavra-passe."
      );
    }

    setARecuperar(false);
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
                onClick={handlePasswordRecovery}
                disabled={aRecuperar || aCarregar}
              >
                {aRecuperar ? "A enviar..." : "Esqueceste-te?"}
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