"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

type Product = {
  _id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/shop");
      const html = document.createElement("div");
      html.innerHTML = res.data;

      const jsonText = html.querySelector("pre")?.textContent;
      if (jsonText) {
        const data = JSON.parse(jsonText);
        setProducts(data.products);
      } else {
        toast.error("Failed to parse product data.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">👜 Shop</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg p-4 shadow">
              <img
                src={`data:image/png;base64,${product.image}`}
                alt={product.name}
                className="w-full h-48 object-cover mb-2 rounded"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-500">
                ₹{product.price - product.discount}{" "}
                <span className="line-through text-sm ml-2 text-red-500">
                  ₹{product.price}
                </span>
              </p>
              <button
                className="mt-2 px-4 py-1 rounded bg-black text-white"
                onClick={() => toast.success("Added to cart (frontend only)")}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
