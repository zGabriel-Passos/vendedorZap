import { useState } from 'react';
import { PRODUCTS } from '@/src/lib/products';
import { Product } from '@/src/types';

interface ProductListProps {
  onAddToCart: (productId: string, quantity: number, variation?: string) => void;
}

export default function ProductList({ onAddToCart }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = Object.values(PRODUCTS).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, quantity, selectedVariation || undefined);
      // Reset form
      setSelectedProduct(null);
      setSelectedVariation(null);
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-0 px-4 py-3 border border-solid border-black/[.08] rounded-md transition-colors focus:border-black/[.15] focus:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] dark:focus:bg-black/[.05] sm:max-w-xs"
        />
        <button
          onClick={handleAddToCart}
          disabled={!selectedProduct}
          className="px-5 py-3 bg-background px-4 text-font transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 sm:max-w-xs"
        >
          Adicionar ao Carrinho
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border border-solid border-black/[.08] rounded-lg p-4 transition-colors hover:border-black/[.12] hover:bg-black/[.01] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
            <div className="flex flex-col items-center gap-3">
              {product.imageUrl && (
                <div className="aspect-[3/2] w-full bg-black/[.03] dark:bg-white/[.05] rounded-md flex items-center justify-center">
                  {/* In a real app, you'd use next/image here */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold text-center">{product.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{product.description}</p>
              <p className="text-base font-medium text-black dark:text-zinc-50">R$ {product.price.toLocaleString('pt-BR')}</p>

              {product.variations && Object.keys(product.variations).length > 0 && (
                <div className="mt-3 w-full">
                  <label className="block text-sm font-medium mb-1">Variação:</label>
                  <select
                    value={selectedVariation || ''}
                    onChange={(e) => setSelectedVariation(e.target.value)}
                    className="w-full px-3 py-2 border border-solid border-black/[.08] rounded-md transition-colors focus:border-black/[.15] focus:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] dark:focus:bg-black/[.05]"
                  >
                    <option value="">Selecione uma variação</option>
                    {Object.entries(product.variations).map(([variation, details]) => (
                      <option key={variation} value={variation}>
                        {variation} - R$ {(details as { price: number }).price.toLocaleString('pt-BR')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-3 w-full space-y-2">
                <label className="block text-sm font-medium mb-1">Quantidade:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-solid border-black/[.08] rounded-md transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.05]"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-solid border-black/[.08] rounded-md transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.05]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="mt-4 p-4 bg-black/[.02] dark:bg-white/[.03] rounded-lg">
          <h3 className="font-semibold mb-2">Resumo da Seleção</h3>
          <p className="mb-1"><strong>Produto:</strong> {PRODUCTS[selectedProduct as keyof typeof PRODUCTS].name}</p>
          {selectedVariation && (
            <p className="mb-1"><strong>Variação:</strong> {selectedVariation}</p>
          )}
          <p className="mb-1"><strong>Quantidade:</strong> {quantity}</p>
          <p className="mt-2 text-base font-medium">
            <strong>Subtotal:</strong>
            {(() => {
              const product = PRODUCTS[selectedProduct as keyof typeof PRODUCTS];
              let price = product.price;
              if (selectedVariation && product.variations?.[selectedVariation]) {
                price = product.variations[selectedVariation].price;
              }
              return (price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            })()}
          </p>
        </div>
      )}
    </div>
  );
}