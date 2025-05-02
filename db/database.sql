CREATE DATABASE mobi_find;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  image VARCHAR(255) NOT NULL
);


CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  UNIQUE(user_id, product_id) 
);

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    data JSONB NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    address TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
