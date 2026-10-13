import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem(
        "atelier_admin_token",
        data.token
      );

      localStorage.setItem(
        "atelier_admin_email",
        data.admin?.email || email
      );

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the admin server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login admin-login-black">
      <div className="admin-3d-background" aria-hidden="true">
        <motion.div
          className="admin-3d-ring ring-one"
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 180],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="admin-3d-ring ring-two"
          animate={{
            rotateY: [0, -360],
            rotateZ: [0, 180],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="admin-3d-cube"
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            y: [0, -35, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </motion.div>

        <motion.i
          className="admin-light-orb orb-black-one"
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.i
          className="admin-light-orb orb-black-two"
          animate={{
            x: [0, -100, 0],
            y: [0, 70, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.section
        className="login-card login-card-black"
        initial={{
          opacity: 0,
          y: 70,
          scale: 0.92,
          rotateX: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
        }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{
          rotateY: -1.5,
          rotateX: 1,
        }}
      >
        <motion.div
          className="login-brand"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <span>AN</span>

          <div>
            <b>ATELIER NOIRE</b>
            <small>STUDIO ADMIN</small>
          </div>
        </motion.div>

        <div className="login-heading login-heading-black">
          <LockKeyhole size={20} />
          <p>SECURE STUDIO ACCESS</p>
          <h1>
            Admin
            <br />
            <i>control.</i>
          </h1>
        </div>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@gmail.com"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password

            <div className="password-field">
              <input
                type={
                  show ? "text" : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShow((value) => !value)
                }
                aria-label={
                  show
                    ? "Hide password"
                    : "Show password"
                }
              >
                {show ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </label>

          {error && (
            <motion.div
              className="login-error"
              initial={{
                opacity: 0,
                x: -12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{
              y: -3,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="admin-login-btn admin-login-btn-black"
            disabled={loading}
          >
            {loading
              ? "Authenticating…"
              : "Enter dashboard"}

            <ArrowRight size={17} />
          </motion.button>
        </form>

        <div className="login-footer">
          <LockKeyhole size={13} />
          Backend-protected studio access
        </div>
      </motion.section>
    </main>
  );
}
