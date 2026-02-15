-- SQL Project: Retail Sales & Customer Insights
-- Target dialect: PostgreSQL

-- 1) SCHEMA SETUP
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    city VARCHAR(80),
    signup_date DATE NOT NULL
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    order_date DATE NOT NULL,
    channel VARCHAR(30) NOT NULL
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    product_id INT NOT NULL REFERENCES products(product_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL
);

-- 2) SAMPLE DATA
INSERT INTO customers (customer_id, full_name, city, signup_date) VALUES
(1, 'Emma Johnson', 'Berlin', '2023-01-12'),
(2, 'Liam Smith', 'Hamburg', '2023-02-02'),
(3, 'Noah Brown', 'Munich', '2023-03-18'),
(4, 'Olivia Davis', 'Cologne', '2023-04-09'),
(5, 'Mia Wilson', 'Frankfurt', '2023-05-21');

INSERT INTO products (product_id, product_name, category, unit_price) VALUES
(101, 'Noise Cancelling Headphones', 'Electronics', 120.00),
(102, 'Mechanical Keyboard', 'Electronics', 80.00),
(103, 'Office Chair', 'Furniture', 150.00),
(104, 'LED Desk Lamp', 'Furniture', 35.00),
(105, 'Water Bottle', 'Lifestyle', 20.00);

INSERT INTO orders (order_id, customer_id, order_date, channel) VALUES
(1001, 1, '2024-01-10', 'Online'),
(1002, 2, '2024-01-11', 'Online'),
(1003, 3, '2024-02-02', 'Store'),
(1004, 1, '2024-02-19', 'Store'),
(1005, 4, '2024-03-07', 'Online'),
(1006, 5, '2024-03-22', 'Online'),
(1007, 2, '2024-04-15', 'Store');

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
(1, 1001, 101, 1, 120.00),
(2, 1001, 105, 2, 20.00),
(3, 1002, 102, 1, 80.00),
(4, 1002, 104, 1, 35.00),
(5, 1003, 103, 1, 150.00),
(6, 1003, 105, 1, 20.00),
(7, 1004, 102, 1, 80.00),
(8, 1004, 104, 2, 35.00),
(9, 1005, 101, 1, 120.00),
(10, 1005, 103, 1, 150.00),
(11, 1006, 105, 3, 20.00),
(12, 1007, 103, 1, 150.00),
(13, 1007, 104, 1, 35.00);

-- 3) ANALYSIS QUERIES

-- A) Monthly revenue and orders
SELECT
    DATE_TRUNC('month', o.order_date) AS month,
    COUNT(DISTINCT o.order_id) AS orders_count,
    SUM(oi.quantity * oi.unit_price) AS revenue,
    ROUND(SUM(oi.quantity * oi.unit_price) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY 1
ORDER BY 1;

-- B) Top products by revenue
SELECT
    p.product_name,
    p.category,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name, p.category
ORDER BY revenue DESC;

-- C) Customer lifetime value ranking
SELECT
    c.customer_id,
    c.full_name,
    SUM(oi.quantity * oi.unit_price) AS lifetime_value,
    RANK() OVER (ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS customer_rank
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.full_name
ORDER BY customer_rank;

-- D) Revenue share by category
WITH category_revenue AS (
    SELECT
        p.category,
        SUM(oi.quantity * oi.unit_price) AS revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    GROUP BY p.category
),
total AS (
    SELECT SUM(revenue) AS total_revenue
    FROM category_revenue
)
SELECT
    cr.category,
    cr.revenue,
    ROUND((cr.revenue / t.total_revenue) * 100, 2) AS revenue_share_pct
FROM category_revenue cr
CROSS JOIN total t
ORDER BY revenue_share_pct DESC;
