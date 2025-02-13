document.addEventListener("DOMContentLoaded", function () {
    const stateTaxRates = {
        "Alabama": 5.00, "Alaska": 0, "Arizona": 4.50, "Arkansas": 6.60, "California": 13.30, "Colorado": 4.63,
        "Connecticut": 6.99, "Delaware": 6.60, "Florida": 0, "Georgia": 5.75, "Hawaii": 7.25, "Idaho": 6.50,
        "Illinois": 4.95, "Indiana": 3.23, "Iowa": 8.53, "Kansas": 5.70, "Kentucky": 5.00, "Louisiana": 6.00,
        "Maine": 7.15, "Maryland": 5.75, "Massachusetts": 5.00, "Michigan": 4.25, "Minnesota": 9.85, "Mississippi": 5.00,
        "Missouri": 5.40, "Montana": 6.75, "Nebraska": 6.84, "Nevada": 0, "New Hampshire": 5.00, "New Jersey": 10.75,
        "New Mexico": 4.90, "New York": 10.90, "North Carolina": 5.25, "North Dakota": 2.90, "Ohio": 4.80,
        "Oklahoma": 5.00, "Oregon": 9.90, "Pennsylvania": 3.07, "Rhode Island": 5.99, "South Carolina": 7.00,
        "South Dakota": 0, "Tennessee": 0, "Texas": 0, "Utah": 4.85, "Vermont": 6.75, "Virginia": 5.75,
        "Washington": 7.00, "West Virginia": 6.50, "Wisconsin": 7.65, "Wyoming": 0
    };

    const stateSelect = document.getElementById("state");
    if (stateSelect) {
        Object.keys(stateTaxRates).forEach(state => {
            let option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    }

    function calculateTax() {
        let saleTotal = Math.round(parseFloat(document.getElementById("saleTotal").value.replace(/[^0-9]/g, "")) || 0);
        let costBasis = Math.round(parseFloat(document.getElementById("costBasis").value.replace(/[^0-9]/g, "")) || 0);
        let income = Math.round(parseFloat(document.getElementById("income").value.replace(/[^0-9]/g, "")) || 0);
        let maritalStatus = document.getElementById("maritalStatus").value;
        let state = document.getElementById("state").value;

        let capitalGain = saleTotal - costBasis;
        if (capitalGain <= 0) {
            document.getElementById("result").innerText = "No taxable capital gain.";
            return;
        }

        let federalRate = maritalStatus === "single" ? (income > 40000 ? 15 : 0) : (income > 80000 ? 15 : 0);
        let NIITRate = income > 200000 ? 3.8 : 0;
        let stateTaxRate = stateTaxRates[state] || 0;

        let federalTax = Math.round((capitalGain * federalRate) / 100);
        let NIITTax = Math.round((capitalGain * NIITRate) / 100);
        let stateTax = Math.round((capitalGain * stateTaxRate) / 100);
        let totalTax = federalTax + NIITTax + stateTax;
        let netGain = capitalGain - totalTax;

        document.getElementById("result").innerHTML = `
            <p>Capital Gain: ${formatCurrency(capitalGain)}</p>
            <p>Federal Tax: ${formatCurrency(federalTax)}</p>
            <p>NIIT Tax: ${formatCurrency(NIITTax)}</p>
            <p>State Tax: ${formatCurrency(stateTax)}</p>
            <p><strong>Total Tax: ${formatCurrency(totalTax)}</strong></p>
            <p><strong>Net Gain After Taxes: ${formatCurrency(netGain)}</strong></p>
        `;

        renderPieChart(saleTotal, federalTax, NIITTax, stateTax, netGain, costBasis);
    }

    function renderPieChart(saleTotal, federalTax, NIITTax, stateTax, netGain, costBasis) {
        const ctx = document.getElementById("taxChart").getContext("2d");

        if (window.pieChartInstance) window.pieChartInstance.destroy(); // Prevent duplicate charts

        window.pieChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Federal Tax", "NIIT Tax", "State Tax", "Net Gain", "Cost Basis"],
                datasets: [{
                    data: [federalTax, NIITTax, stateTax, netGain, costBasis],
                    backgroundColor: [
                        "#c99b2b",  // Federal Tax (Original)
                        "#b08920",  // NIIT Tax (Darker)
                        "#d4a045",  // State Tax (Lighter)
                        "#000000",  // Net Gain (Black)
                        "#d3d3d3"   // Cost Basis (Dark Blue)
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    document.querySelector(".btn-calculate").addEventListener("click", calculateTax);

    document.getElementById("taxForm").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            let inputs = Array.from(document.querySelectorAll("input, select"));
            let index = inputs.indexOf(document.activeElement);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    function handleBlur(event) {
        let value = event.target.value.replace(/[^0-9]/g, "");
        event.target.value = value ? formatCurrency(Math.round(value)) : "";
    }

    document.getElementById("saleTotal").addEventListener("blur", handleBlur);
    document.getElementById("costBasis").addEventListener("blur", handleBlur);
    document.getElementById("income").addEventListener("blur", handleBlur);
});
