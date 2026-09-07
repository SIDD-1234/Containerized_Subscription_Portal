import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [subscriptions, setSubscriptions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    provider: "",
    category: "",
    cost: "",
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "",
    renewalDate: "",
    status: "ACTIVE"
  });

  const loadSubscriptions = async () => {

    const response = await fetch(
      "http://localhost:8080/api/subscriptions"
    );

    const data = await response.json();

    setSubscriptions(data);
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (Number(form.cost) < 0) {
      alert("Cost cannot be negative.");
      return;
    }

    if (form.renewalDate < form.startDate) {
      alert("Renewal date cannot be before start date.");
      return;
    }

    await fetch(
      "http://localhost:8080/api/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          cost: Number(form.cost)
        })
      }
    );

    setForm({
      name: "",
      provider: "",
      category: "",
      cost: "",
      currency: "INR",
      billingCycle: "Monthly",
      startDate: "",
      renewalDate: "",
      status: "ACTIVE"
    });

    loadSubscriptions();
  };

  return (
    <div className="container">

      <h1>Subscription Management Portal</h1>

      <div className="form-section">

        <h2>Add Subscription</h2>

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
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
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

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button type="submit">
            Add Subscription
          </button>

        </form>

      </div>

      <div className="list-section">

        <h2>My Subscriptions</h2>

        {subscriptions.length === 0 ? (
          <p>No subscriptions added yet.</p>
        ) : (

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Provider</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Billing</th>
                <th>Renewal</th>
                <th>Status</th>
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

                  <td>
                    {subscription.billingCycle}
                  </td>

                  <td>
                    {subscription.renewalDate}
                  </td>

                  <td>
                    {subscription.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default App;