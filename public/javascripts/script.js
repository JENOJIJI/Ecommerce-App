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

function changeQuantity(cartId, productId, userId, count) {
  quantity = parseInt(document.getElementById(productId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      cart: cartId,
      product: productId,
      user: userId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        alert("Product Removed from cart");
        location.reload();
      } else {
        console.log(response);
        document.getElementById(productId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = response.totalPrice;
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

$(document).ready(function () {
  $("#checkout-form").submit(function (event) {
    event.preventDefault();

    var formData = $(this).serialize();

    $.ajax({
      type: "POST",
      url: "/place-order", // URL to your Express route
      data: formData,
      success: function (response) {
        // Handle success response
        location.href = "/order-success";
        // Optionally, perform actions like showing a success message
      },
      error: function (xhr, status, error) {
        // Handle error
        console.error(error);
      },
    });
  });
});
