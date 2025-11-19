// src/pages/ClientLogin/ClientLogin.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./ClientLogin.css";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // 🔹 Forgot Password States
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // ✅ Function to reset password without old password
  const handlePasswordReset = async () => {
    if (!resetEmail || !newPassword) {
      setResetMessage("Please fill in both fields.");
      return;
    }

    try {
      const usersRef = collection(db, "clients-login");
      const q = query(usersRef, where("email", "==", resetEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResetMessage("❌ No user found with this email.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, "clients-login", userDoc.id);

      await updateDoc(userRef, { password: newPassword });

      setResetMessage("Password reset successfully!");
      setNewPassword("");
      // ✅ Wait 2 seconds, then go back to login mode
      setTimeout(() => {
        setShowResetPopup(false);
        setResetMessage("");
        setResetEmail("");
      }, 1000);
    } catch (error) {
      console.error("Password reset error:", error);
      setResetMessage("❌ Failed to reset password. Try again.");
    }
  };


  useEffect(() => {
    let timer, warningTimer, countdownInterval;

    const startTimers = () => {
      // Clear existing timers
      clearTimeout(timer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);

      // Show warning after 4 minutes (240000 ms)
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setCountdown(60);

        // Start countdown from 60 → 0
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
            }
            return prev - 1;
          });
        }, 1000);
      }, 4 * 60 * 1000);

      // Auto logout after 5 minutes (300000 ms)
      timer = setTimeout(() => {
        localStorage.removeItem("clientUser");
        localStorage.removeItem("clientUserEmail");
        window.location.href = "/";
      }, 5 * 60 * 1000);
    };

    const resetTimer = () => {
      setShowWarning(false);
      setCountdown(60);
      startTimers();
    };

    // Activity events
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    startTimers();

    return () => {
      clearTimeout(timer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  // Update countdown timer when locked
  useEffect(() => {
    let interval;
    if (isLocked && lockTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const lockDuration = 15 * 60 * 1000;
        const timeLeft = lockDuration - (currentTime - lockTime);

        if (timeLeft <= 0) {
          setIsLocked(false);
          setFailedAttempts(0);
          setLockTime(null);
          localStorage.removeItem("clientLoginLockTime");
          localStorage.removeItem("clientLoginFailedAttempts");
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockTime]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError("Account temporarily locked. Please try again later.");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Query Firestore for the client user
      const usersRef = collection(db, "clients-login");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        handleFailedAttempt();
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // 🔹 Step 2: Check client status from 'clients' collection
      const clientsRef = collection(db, "clients");
      const clientQuery = query(clientsRef, where("email", "==", email));
      const clientSnapshot = await getDocs(clientQuery);

      if (clientSnapshot.empty) {
        handleFailedAttempt();
        setError("No client record found.");
        setLoading(false);
        return;
      }

      const clientData = clientSnapshot.docs[0].data();

      // 🔹 Step 3: Check if client status is Inactive
      if (clientData.status && clientData.status.toLowerCase() === "inactive") {
        setError("Your account is currently inactive. Please contact support.");
        setLoading(false);
        return;
      }

      // Check if password matches
      if (userData.password === password) {
        // Successful login - reset failed attempts
        localStorage.removeItem("clientLoginFailedAttempts");
        localStorage.removeItem("clientLoginLockTime");
        setFailedAttempts(0);

        // Store user session
        localStorage.setItem("clientUser", JSON.stringify({
          email: userData.email,
          clientId: userData.clientId,
          clientName: userData.clientName,
          loginTime: Date.now()
        }));

        // ✅ Also store logged-in email separately
        localStorage.setItem("clientUserEmail", userData.email);

        // Redirect to client dashboard
        window.location.href = "/client-dashboard";
      } else {
        handleFailedAttempt();
        setError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = () => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);

    // Store attempts in localStorage
    localStorage.setItem("clientLoginFailedAttempts", newFailedAttempts.toString());

    if (newFailedAttempts >= 3) {
      // Lock the account for 15 minutes
      const lockTime = Date.now();
      setIsLocked(true);
      setLockTime(lockTime);
      localStorage.setItem("clientLoginLockTime", lockTime.toString());
      setError("Too many failed attempts. Account locked for 15 minutes.");
    } else {
      setError(`Invalid credentials. ${3 - newFailedAttempts} attempts remaining.`);
    }
  };

  const getTimeLeft = () => {
    if (!isLocked || !lockTime) return 0;

    const currentTime = Date.now();
    const lockDuration = 15 * 60 * 1000;
    const timeLeft = lockDuration - (currentTime - lockTime);

    return Math.max(0, Math.ceil(timeLeft / 1000)); // Return seconds
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="client-login">
      <div className="login-card">
        <h2 className="login-title">Two Seas <br />Client Portal</h2>

        {!showResetPopup ? (
          <>
            <p className="login-subtitle">Please sign in to continue</p>

            {error && (
              <div className={`error-message ${isLocked ? 'locked' : ''}`}>
                {error}
                {isLocked && (
                  <div className="countdown">
                    Time remaining: {formatTime(getTimeLeft())}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLocked || loading}
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLocked || loading}
                />
              </div>

              <button
                type="submit"
                className={`login-btn ${isLocked ? 'disabled' : ''}`}
                disabled={isLocked || loading}
              >
                {loading ? (
                  <span className="loading-text">Signing in...</span>
                ) : isLocked ? (
                  <span className="locked-text">Account Locked</span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="login-footer">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowResetPopup(true);
                  setResetMessage("");
                  setResetEmail("");
                  setNewPassword("");
                }}
              >
                Forgot Password?
              </a>
            </div>

            {failedAttempts > 0 && !isLocked && (
              <div className="attempts-warning">
                Failed attempts: {failedAttempts}/3
              </div>
            )}
          </>
        ) : (
          <>
            <p className="login-subtitle">Reset your password</p>

            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button onClick={handlePasswordReset} className="login-btn">
              Update Password
            </button>

            <div className="login-footer">
              <a
                href="#"
                onClick={() => setShowResetPopup(false)}
              >
                Back to Login
              </a>
            </div>

            {resetMessage && <p className="reset-message">{resetMessage}</p>}
          </>
        )}
      </div>
      {showWarning && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#f59e0b",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 9999
        }}>
          ⚠️ You will be logged out in {countdown} seconds due to inactivity.
        </div>
      )}
    </div>

  );
}