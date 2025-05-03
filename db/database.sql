CREATE DATABASE mobi_find;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 

CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL DEFAULT 'user'
);

CREATE TABLE products (
    product_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    isAvailable BOOLEAN DEFAULT TRUE
);


CREATE TABLE categories (
    category_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE orders (
    order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    data JSONB NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  product_id UUID REFERENCES products(product_id),
  quantity INT NOT NULL CHECK (quantity > 0),
  UNIQUE(user_id, product_id) 
);