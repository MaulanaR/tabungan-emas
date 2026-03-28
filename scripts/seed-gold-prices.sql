-- Insert initial gold prices data
INSERT INTO public.gold_prices (brand, buy_price, sell_price, price_change_percent)
VALUES
  ('Antam', 1132000, 1031000, 0.8),
  ('UBS', 1115000, 1012000, -0.3),
  ('Emasku', 1108000, 1005000, 1.2)
ON CONFLICT DO NOTHING;
