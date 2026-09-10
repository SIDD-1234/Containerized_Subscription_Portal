import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/subscriptions";

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
    } catch (error) {
      setMessage(error.message);
    }
  };

  const [dashboard, setDashboard] = useState({
    total: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    draft: 0,
    monthlyCost: 0,
  });

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

      setMessage(
        editingId
          ? "Subscription updated successfully."
          : "Subscription created successfully."
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadSubscriptions(search);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (subscription) => {
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
  };

  const updateStatus = async (id, newStatus) => {
    setMessage("");

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
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadSubscriptions(value);
  };
  const loadDashboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/dashboard/summary"
      );

      if (!response.ok) {
        throw new Error("Failed to load dashboard.");
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="container">
      <h1>Subscription Management Portal</h1>
      <section className="dashboard">
        <h2>Summary Dashboard</h2>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h3>Total</h3>
            <p>{dashboard.total}</p>
          </div>

          <div className="dashboard-card">
            <h3>Active</h3>
            <p>{dashboard.active}</p>
          </div>

          <div className="dashboard-card">
            <h3>Draft</h3>
            <p>{dashboard.draft}</p>
          </div>

          <div className="dashboard-card">
            <h3>Paused</h3>
            <p>{dashboard.paused}</p>
          </div>

          <div className="dashboard-card">
            <h3>Cancelled</h3>
            <p>{dashboard.cancelled}</p>
          </div>

          <div className="dashboard-card">
            <h3>Monthly Cost</h3>
            <p>₹{dashboard.monthlyCost.toFixed(2)}</p>
          </div>

        </div>
      </section>

      <div className="message">
        {message}
      </div>

      <section className="card">
        <h2>Current User Role</h2>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="USER">USER</option>
          <option value="MANAGER">MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <p>
          Current role: <strong>{role}</strong>
        </p>
      </section>

      <section className="card">
        <h2>
          {editingId ? "Update Subscription" : "Add Subscription"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Subscription Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="provider"
            placeholder="Provider"
            value={form.provider}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            name="cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="Cost"
            value={form.cost}
            onChange={handleChange}
            required
          />

          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          <select
            name="billingCycle"
            value={form.billingCycle}
            onChange={handleChange}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="QUARTERLY">Quarterly</option>
          </select>

          <label>Start Date</label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <label>Renewal Date</label>
          <input
            name="renewalDate"
            type="date"
            value={form.renewalDate}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update Subscription" : "Create Subscription"}
          </button>

          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Search Subscriptions</h2>

        <input
          type="text"
          placeholder="Search by name or provider..."
          value={search}
          onChange={handleSearch}
        />
      </section>

      <section className="card">
        <h2>Subscriptions</h2>

        {subscriptions.length === 0 ? (
          <p>No subscriptions found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Billing</th>
                <th>Start Date</th>
                <th>Renewal</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.name}</td>
                  <td>{subscription.provider}</td>
                  <td>{subscription.category}</td>
                  <td>
                    {subscription.currency} {subscription.cost}
                  </td>
                  <td>{subscription.billingCycle}</td>
                  <td>{subscription.startDate}</td>
                  <td>{subscription.renewalDate}</td>
                  <td>
                    <strong>{subscription.status}</strong>

                    {role === "ADMIN" || role === "MANAGER" ? (
                      <div>
                        {subscription.status === "DRAFT" && (
                          <button
                            onClick={() =>
                              updateStatus(subscription.id, "ACTIVE")
                            }
                          >
                            Activate
                          </button>
                        )}

                        {subscription.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              updateStatus(subscription.id, "PAUSED")
                            }
                          >
                            Pause
                          </button>
                        )}

                        {subscription.status === "PAUSED" && (
                          <button
                            onClick={() =>
                              updateStatus(subscription.id, "ACTIVE")
                            }
                          >
                            Activate
                          </button>
                        )}

                        {subscription.status !== "CANCELLED" && (
                          <button
                            onClick={() =>
                              updateStatus(subscription.id, "CANCELLED")
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ) : (
                      <small>No permission</small>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(subscription)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;