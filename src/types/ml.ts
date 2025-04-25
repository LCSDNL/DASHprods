export interface Attribute {
    id: string;
    value_name: string;
  }
  
  export interface Shipping {
    free_shipping: boolean;
  }
  
  export interface Variation { 
    // adapte conforme seu shape
    [key: string]: any;
  }
  
  export interface Product {
    id: string;
    seller_custom_field?:string;
    title: string;
    thumbnail: string;
    available_quantity: number;
    sold_quantity: number;
    price: number;
    condition: string;
    warranty?: string;
    permalink: string;
    attributes?: Attribute[];
    shipping?: Shipping;
    variations?: Variation[];
  }
  interface ProdutoML {
    id: string;
  }
  