function addToCart(productId) {
  $.ajax({
    url: "/add-to-cart/" + productId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cartCount").html();
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
      }
    },
  });
}

function changeQuantity(cartId, productId, count) {
  quantity = parseInt(document.getElementById(productId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      cart: cartId,
      product: productId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        alert("Product Removed from cart");
        location.reload();
      } else {
        document.getElementById(productId).innerHTML = quantity + count;
      }
    },
  });
}

function removeItem(cartId, productId) {
  $.ajax({
    url: "/remove-cart-item",
    data: {
      cartId: cartId,
      productId: productId,
    },
    method: "post",
    success: (response) => {
      location.reload();
    },
  });
}