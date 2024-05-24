import {Button, Row} from "react-bootstrap";
import ProductPreview from "@/app/fragment/ProductPreview";

const ProductCard = ({
                         imageUrl,
                         name,
                         description,
                         price,
                         status,
                         created,
                         updated,
                         userId,
                         owner,
                         productId,
                         addToCartAction,
                         editAction
                     }) => {

    let button;

    if (status === "SO" && (!userId || owner !== userId)) {
        button = <Button variant="outline-primary" disabled={true}>Sold</Button>;
    } else if (userId && owner === userId) {
        button = <Button variant="outline-dark" className={"mt-2"} onClick={() => editAction(productId)}>Edit</Button>;
    } else {
        button = <Button variant="outline-primary" onClick={addToCartAction}>Add to Cart</Button>;
    }

    return (
        <ProductPreview title={name} description={description} price={price} imageUrl={imageUrl} status={status}
                        created={created} updated={updated} child={
            <Row>
                {button}
            </Row>
        }/>);


}
export default ProductCard;