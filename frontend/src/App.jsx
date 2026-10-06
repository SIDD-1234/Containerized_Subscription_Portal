import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/subscriptions";

const emptyForm = {
  name: "",
  provider: "",
  category: "",
  cost: "",
  currency: "INR",
  billingCycle: "MONTHLY",
  startDate: "",
  renewalDate: "",
  status: "DRAFT",
};

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("USER");
  const [activeView, setActiveView] = useState("dashboard");

  const [dashboard, setDashboard] = useState({
    total: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    draft: 0,
    monthlyCost: 0,
  });

  const isAdmin = role === "ADMIN";
  const isModerator = role === "MODERATOR";
  const canManageStatus = isAdmin || isModerator;
  const canManageSubscriptions = isAdmin;

  const loadSubscriptions = async (query = "") => {
    try {
      const url = query.trim()
        ? `${API_URL}?q=${encodeURIComponent(query)}`
        : API_URL;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load subscriptions.");
      }

      const data = await response.json();
      setSubscriptions(data);

      return true;
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      setMessage(error.message);
      return false;
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch("/api/dashboard/summary");

      if (!response.ok) {
        throw new Error("Failed to load dashboard.");
      }

      const data = await response.json();
      setDashboard(data);

      return true;
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      return false;
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!canManageSubscriptions) {
      setMessage("Only Admin users can create or edit subscriptions.");
      return;
    }

    if (Number(form.cost) < 0) {
      setMessage("Subscription cost cannot be negative.");
      return;
    }

    if (
      form.startDate &&
      form.renewalDate &&
      form.renewalDate < form.startDate
    ) {
      setMessage("Renewal date cannot be before start date.");
      return;
    }

    const subscriptionData = {
      ...form,
      cost: Number(form.cost),
      status: form.status || "DRAFT",
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriptionData),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || "Request failed.");
      }

      const successMessage = editingId
        ? "Subscription updated successfully."
        : "Subscription created successfully.";

      setForm(emptyForm);
      setEditingId(null);

      await Promise.all([
        loadSubscriptions(search),
        loadDashboard(),
      ]);

      setMessage(successMessage);
      setActiveView("subscriptions");
    } catch (error) {
      console.error("Subscription operation failed:", error);
      setMessage(error.message || "Request failed.");
    }
  };

  const handleEdit = (subscription) => {
    if (!canManageSubscriptions) {
      setMessage("Only Admin users can edit subscriptions.");
      return;
    }

    setEditingId(subscription.id);

    setForm({
      name: subscription.name || "",
      provider: subscription.provider || "",
      category: subscription.category || "",
      cost: subscription.cost ?? "",
      currency: subscription.currency || "INR",
      billingCycle: subscription.billingCycle || "MONTHLY",
      startDate: subscription.startDate || "",
      renewalDate: subscription.renewalDate || "",
      status: subscription.status || "DRAFT",
    });

    setMessage("");
    setActiveView("add");
  };

  const updateStatus = async (id, newStatus) => {
    setMessage("");

    if (!canManageStatus) {
      setMessage("You do not have permission to change subscription status.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}/status?status=${newStatus}`,
        {
          method: "PATCH",
          headers: {
            "X-User-Role": role,
          },
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || "Failed to update status.");
      }

      setMessage(`Subscription status changed to ${newStatus}.`);

      await loadSubscriptions(search);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setActiveView("subscriptions");
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadSubscriptions(value);
  };

  const getStatusClass = (status) => {
    const safeStatus = String(status || "UNKNOWN").toLowerCase();
    return `status-badge status-${safeStatus}`;
  };

  const formatCurrency = (value, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  };

  const renderStatusActions = (subscription) => {
    if (!canManageStatus) {
      return <span className="muted-text">View only</span>;
    }

    return (
      <div className="status-actions">
        {subscription.status !== "ACTIVE" &&
          subscription.status !== "CANCELLED" && (
            <button
              className="action-button activate"
              onClick={() =>
                updateStatus(subscription.id, "ACTIVE")
              }
            >
              Activate
            </button>
          )}

        {subscription.status === "ACTIVE" && (
          <button
            className="action-button cancel"
            onClick={() =>
              updateStatus(subscription.id, "CANCELLED")
            }
          >
            Cancel
          </button>
        )}

        {subscription.status !== "CANCELLED" &&
          subscription.status !== "ACTIVE" && (
            <button
              className="action-button cancel"
              onClick={() =>
                updateStatus(subscription.id, "CANCELLED")
              }
            >
              Cancel
            </button>
          )}
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Subscription Dashboard</h1>
          <p className="page-description">
            Monitor your subscription portfolio at a glance.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">▣</div>
          <div>
            <span>Total Subscriptions</span>
            <strong>{dashboard.total}</strong>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✓</div>
          <div>
            <span>Active</span>
            <strong>{dashboard.active}</strong>
          </div>
        </div>

        <div className="stat-card draft">
          <div className="stat-icon">◷</div>
          <div>
            <span>Draft</span>
            <strong>{dashboard.draft}</strong>
          </div>
        </div>

        <div className="stat-card paused">
          <div className="stat-icon">Ⅱ</div>
          <div>
            <span>Paused</span>
            <strong>{dashboard.paused}</strong>
          </div>
        </div>

        <div className="stat-card cancelled">
          <div className="stat-icon">×</div>
          <div>
            <span>Cancelled</span>
            <strong>{dashboard.cancelled}</strong>
          </div>
        </div>

        <div className="stat-card cost">
          <div className="stat-icon">₹</div>
          <div>
            <span>Monthly Cost</span>
            <strong>
              ₹{Number(dashboard.monthlyCost || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">RECENT</p>
              <h2>Subscriptions</h2>
            </div>

            <button
              className="secondary-button"
              onClick={() => setActiveView("subscriptions")}
            >
              View all
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">○</div>
              <h3>No subscriptions yet</h3>
              <p>Add a subscription to get started.</p>
            </div>
          ) : (
            <div className="recent-list">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div className="recent-item" key={subscription.id}>
                  <div className="subscription-avatar">
                    {subscription.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div className="recent-info">
                    <strong>{subscription.name}</strong>
                    <span>{subscription.provider}</span>
                  </div>

                  <span className={getStatusClass(subscription.status)}>
                    {subscription.status}
                  </span>

                  <strong className="recent-cost">
                    {formatCurrency(
                      subscription.cost,
                      subscription.currency
                    )}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderSubscriptions = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MANAGEMENT</p>
          <h1>Subscriptions</h1>
          <p className="page-description">
            Search and manage your subscription portfolio.
          </p>
        </div>

        {isAdmin && (
          <button
            className="primary-button"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setMessage("");
              setActiveView("add");
            }}
          >
            + Add Subscription
          </button>
        )}
      </div>

      <div className="panel">
        <div className="search-container">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name or provider..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <h3>No subscriptions found</h3>
            <p>Try changing your search or add a new subscription.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="subscription-table">
              <thead>
                <tr>
                  <th>SUBSCRIPTION</th>
                  <th>CATEGORY</th>
                  <th>COST</th>
                  <th>BILLING</th>
                  <th>RENEWAL</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>
                      <div className="subscription-cell">
                        <div className="subscription-avatar">
                          {subscription.name
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                        </div>

                        <div>
                          <strong>{subscription.name}</strong>
                          <span>{subscription.provider}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-pill">
                        {subscription.category}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          subscription.cost,
                          subscription.currency
                        )}
                      </strong>
                    </td>

                    <td>
                      {subscription.billingCycle
                        ? subscription.billingCycle.charAt(0).toUpperCase() +
                        subscription.billingCycle.slice(1).toLowerCase()
                        : "-"}
                    </td>

                    <td>{subscription.renewalDate}</td>

                    <td>
                      <span
                        className={getStatusClass(subscription.status)}
                      >
                        {subscription.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        {isAdmin && (
                          <button
                            className="icon-button"
                            title="Edit subscription"
                            onClick={() =>
                              handleEdit(subscription)
                            }
                          >
                            Edit
                          </button>
                        )}

                        {renderStatusActions(subscription)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderAddSubscription = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {editingId ? "EDIT" : "NEW SUBSCRIPTION"}
          </p>
          <h1>
            {editingId
              ? "Update Subscription"
              : "Add Subscription"}
          </h1>
          <p className="page-description">
            {editingId
              ? "Update the subscription details below."
              : "Enter the details of your new subscription."}
          </p>
        </div>
      </div>

      <div className="form-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Subscription Name</label>
              <input
                name="name"
                placeholder="e.g. Netflix"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Provider</label>
              <input
                name="provider"
                placeholder="e.g. Netflix Inc."
                value={form.provider}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <input
                name="category"
                placeholder="e.g. Entertainment"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Cost</label>
              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.cost}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="form-field">
              <label>Billing Cycle</label>
              <select
                name="billingCycle"
                value={form.billingCycle}
                onChange={handleChange}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>

            <div className="form-field">
              <label>Start Date</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Renewal Date</label>
              <input
                name="renewalDate"
                type="date"
                value={form.renewalDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId
                ? "Update Subscription"
                : "Create Subscription"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );

  const renderAnalytics = () => {
    if (!isAdmin) {
      return (
        <div className="access-denied">
          <div className="access-icon">!</div>
          <h2>Admin Access Required</h2>
          <p>
            Analytics are available only to Admin users.
          </p>
        </div>
      );
    }

    const total = dashboard.total || 1;

    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">INSIGHTS</p>
            <h1>Analytics</h1>
            <p className="page-description">
              Overview of your subscription portfolio.
            </p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="panel analytics-card">
            <span>Active Rate</span>
            <strong>
              {((dashboard.active / total) * 100).toFixed(1)}%
            </strong>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(dashboard.active / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="panel analytics-card">
            <span>Cancellation Rate</span>
            <strong>
              {((dashboard.cancelled / total) * 100).toFixed(1)}%
            </strong>
            <div className="progress-bar">
              <div
                className="progress-fill cancelled-fill"
                style={{
                  width: `${(dashboard.cancelled / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="panel analytics-card">
            <span>Paused Rate</span>
            <strong>
              {((dashboard.paused / total) * 100).toFixed(1)}%
            </strong>
            <div className="progress-bar">
              <div
                className="progress-fill paused-fill"
                style={{
                  width: `${(dashboard.paused / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="panel analytics-card">
            <span>Monthly Spending</span>
            <strong>
              ₹{Number(dashboard.monthlyCost || 0).toFixed(2)}
            </strong>
            <p className="analytics-note">
              Current estimated recurring monthly cost
            </p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SubTrack</strong>
            <span>Management Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">MENU</p>

          <button
            className={
              activeView === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveView("dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={
              activeView === "subscriptions"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActiveView("subscriptions")}
          >
            <span>▤</span>
            Subscriptions
          </button>

          {isAdmin && (
            <button
              className={
                activeView === "analytics"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActiveView("analytics")}
            >
              <span>◔</span>
              Analytics
            </button>
          )}

          {isAdmin && (
            <button
              className={
                activeView === "add"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setMessage("");
                setActiveView("add");
              }}
            >
              <span>＋</span>
              Add Subscription
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="role-selector">
            <span className="nav-label">CURRENT ROLE</span>

            <select
              value={role}
              onChange={(event) => {
                const newRole = event.target.value;

                setRole(newRole);
                setMessage("");

                if (newRole !== "ADMIN" && activeView === "analytics") {
                  setActiveView("dashboard");
                }

                if (newRole !== "ADMIN" && activeView === "add") {
                  setActiveView("subscriptions");
                }
              }}
            >
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="user-profile">
            <div className="profile-avatar">
              {role.charAt(0)}
            </div>
            <div>
              <strong>{role}</strong>
              <span>
                {isAdmin
                  ? "Full access"
                  : isModerator
                    ? "Status management"
                    : "View only"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Subscription Management
            <span>/</span>
            {activeView === "dashboard"
              ? "Dashboard"
              : activeView === "subscriptions"
                ? "Subscriptions"
                : activeView === "analytics"
                  ? "Analytics"
                  : "Add Subscription"}
          </div>

          <div className="topbar-role">
            <span className="role-dot" />
            {role}
          </div>
        </header>

        <div className="content-area">
          {message && (
            <div className="message-banner">
              <span>{message}</span>
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {activeView === "dashboard" && renderDashboard()}
          {activeView === "subscriptions" && renderSubscriptions()}
          {activeView === "add" && renderAddSubscription()}
          {activeView === "analytics" && renderAnalytics()}
        </div>
      </main>
    </div>
  );
}

export default App;