import { Bar } from "react-chartjs-2";

interface CategoryTotal {
    [category: string]: number;
}

const HorizontalBarChart: React.FC<{ categoryTotals: CategoryTotal; totalAmount: number }> = ({ categoryTotals, totalAmount }) => {
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
  
    const data = {
      labels: [""],
      datasets: categories.map((category, index) => ({
        label: category,
        data: [(amounts[index])],
        backgroundColor: [
          '#FF5252', // Medium Red
          '#448AFF', // Medium Blue
          '#69F0AE', // Medium Green
          '#B388FF', // Medium Purple
          '#FF4081', // Medium Pink
          '#FFB74D', // Medium Orange
          '#4DB6AC', // Medium Teal
          '#8D6E63', // Medium Brown
          '#78909C', // Medium Blue Grey
          '#9E9E9E', // Medium Grey
          '#C0CA33', // Medium Lime
          '#5C6BC0', // Medium Indigo
          '#26C6DA', // Medium Cyan
          '#7E57C2', // Medium Deep Purple
          '#EC407A', // Medium Pink
        ][index % 15], // Use modulo to cycle through colors if there are more than 15 categories
      })),
    };
  
    const options = {
      indexAxis: "y" as const,
      scales: {
        x: {
          stacked: true,
          display: false,
        },
        y: {
          stacked: true,
          display: false,
        },
      },
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: 'bottom' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.x !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(context.parsed.x);
              }
              return label;
            }
          }
        },
      },
      maintainAspectRatio: false,
      height: 50,
      animation: {
        duration: 3000, // Increase animation duration to 2 seconds (2000 milliseconds)
        // easing: 'easeOutQuart', // Use a smoother easing function
      },
    };
  
    return (
      <div style={{ height: "25px", position: "relative" }}>
        <Bar data={data} options={options} />
      </div>
    );
  };

  export default HorizontalBarChart;