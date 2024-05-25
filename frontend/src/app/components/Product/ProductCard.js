import ProductPreview from "@/app/components/Product/ProductPreview";

const ProductCard = ({
                         id,
                         name,
                         category,
                         sub_category,
                         price,
                         comparison_price,
                         comparison_unit,
                         currency,
                         image,
                         created,
                         updated,
                         store
                     }) => {

    return (
        <ProductPreview id={id} name={name} category={category} sub_category={sub_category} price={price}
                        comparison_price={comparison_price} comparison_unit={comparison_unit} currency={currency}
                        image={image} created={created} updated={updated} store={store}/>
    );

}

export default ProductCard;