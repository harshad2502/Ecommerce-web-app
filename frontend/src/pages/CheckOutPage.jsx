import React, { useEffect, useState } from "react";
import { CheckIcon, ClockIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCart, deleteItem } from "../features/cart/cartAPI";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../features/user/userAPI";
import {
  createOrder,
  razorpayCheckoutHandler,
} from "../features/order/orderAPI";
import AddAddress from "../features/user/components/AddAddress";
import { discountedPrice } from "../app/constants";

const initialValues = {
  name: "",
  street: "",
  city: "",
  pinCode: "",
  state: "",
  phone: "",
};

function CheckOutPage() {
  const products = useSelector((state) => state.cart.cartItems);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [totalSum, setTotalSum] = new useState(0);
  const [payment, setPaymentMethod] = useState(null);
  const currentOrder = useSelector((state) => state.order.currentOrder);
  const user = useSelector((state) => state.user.userInfo);
  const addresses = useSelector((state) => state.user.userInfo.addresses);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleQuantityChange = (e, product) => {
    dispatch(updateCart({ id: product.id, quantity: +e.target.value }));
  };
  const handelDeleteItem = (productId) => {
    dispatch(deleteItem(productId));
  };
  const calculateTotalSum = (products) => {
    let sum = 0;
    for (let i = 0; i < products.length; i++) {
      sum += discountedPrice(products[i].product) * products[i].quantity;
    }
    return sum;
  };
  const handelAddress = async (values) => {
    dispatch(updateUser({ ...user, addresses: [...user.addresses, values] }));
  };
  const handelOnlinePayment = async (amount, e) => {
    e.preventDefault();
    dispatch(razorpayCheckoutHandler(amount));
  };
  const totalItem = products.reduce((total, item) => item.quantity + total, 0);
  const handelOrder = async () => {
    if (selectedAddress && payment) {
      const order = {
        products,
        totalSum,
        totalItem,
        selectedAddress,
        payment,
        user: user.id,
        status: "pending",
      };
      dispatch(createOrder(order));
      // navigate("/order-success");
    } else {
      alert("Enter address and payment method : ");
    }
  };
  useEffect(() => {
    setTotalSum(calculateTotalSum(products));
  }, [products]);
  return (
    <div className="bg-white   bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
      {!products.length && navigate("/home")}
      {currentOrder && navigate(`/order-success/${currentOrder.id}`)}
      {/* Background color split screen for large screens */}
      <div
        className="hidden lg:block fixed top-0 left-0 w-1/2 h-full  "
        aria-hidden="true"
      />
      <div
        className="hidden lg:block fixed top-0 right-0 w-1/2 h-full"
        aria-hidden="true"
      />

      <main className=" relative grid grid-cols-1 gap-x-16 max-w-7xl mx-auto lg:px-8 lg:grid-cols-2">
        <div className="my-14 rounded-lg">
          <section
            aria-labelledby="payment-and-shipping-heading"
            className="px-14 bg-white rounded-lg lg:max-w-lg lg:w-full lg:mx-auto lg:pt-0 lg:pb-24 lg:row-start-1 lg:col-start-1"
          >
            <img
              className="mx-auto h-auto w-[160px] rounded-full"
              src="./assets/logo.png"
              alt="prime delivery"
            />
            <div className=" lg:max-w-none lg:px-0">
              <AddAddress
                handelAddress={handelAddress}
                initialValues={initialValues}
              />
            </div>
            <form>
              <div className="max-w-2xl mx-auto px-4 lg:max-w-none lg:px-0">
                <div className="mt-10">
                  <h3
                    id="shipping-heading"
                    className="text-lg font-medium text-gray-900"
                  >
                    Chose from existing address
                  </h3>
                  <div>
                    <ul role="list" className="divide-y divide-gray-100">
                      {addresses?.map((person, index) => (
                        <li
                          key={index}
                          className="flex justify-between gap-x-6 py-5"
                        >
                          <div className="flex min-w-0 gap-x-4">
                            <input
                              // id={paymentMethod.id}
                              name="address"
                              type="radio"
                              checked={selectedAddress === person}
                              onChange={() => {
                                setSelectedAddress(person);
                              }}
                              className="relative top-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 "
                            />
                            <div className="min-w-0 flex-auto">
                              <p className="text-sm font-semibold leading-6 text-gray-900">
                                {person.name}
                              </p>
                              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                {person.street}
                              </p>
                              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                {person.phone}
                              </p>
                            </div>
                          </div>
                          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                            <p className="text-sm leading-6 text-gray-900">
                              {person.city}
                            </p>
                            <p className="text-sm leading-6 text-gray-900">
                              {person.state}
                            </p>
                            <p className="text-sm leading-6 text-gray-900">
                              {person.pinCode}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Payment */}
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h2 className="text-lg font-medium text-gray-900">Payment</h2>

                  <fieldset className="mt-4">
                    <legend className="sr-only">Payment type</legend>
                    <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                      <div>
                        <input
                          value={0}
                          name="payment-type"
                          type="radio"
                          onChange={(e) => {
                            setPaymentMethod("card");
                          }}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label className="text-sm font-semibold leading-6 text-gray-900 mx-2">
                          Card
                        </label>
                        <input
                          value={1}
                          name="payment-type"
                          type="radio"
                          onChange={() => {
                            setPaymentMethod("cash");
                          }}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label className="text-sm font-semibold leading-6 text-gray-900 mx-2">
                          Cash
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="flex justify-end  border-gray-200">
                  {payment === "card" && (
                    <button
                      type="submit"
                      onClick={(e) => handelOnlinePayment(totalSum, e)}
                      className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent  px-8 py-3 text-base font-medium text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r bg-red-400"
                    >
                      Pay now with Razorpay
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>
        </div>
        <section
          aria-labelledby="summary-heading"
          className="  text-white mt-16 pt-6  md:px-10 lg:max-w-lg lg:w-full lg:mx-auto lg:px-0 
          lg:pt-0 lg:pb-24 lg:bg-transparent lg:row-start-1 lg:col-start-2"
        >
          <div className="bg-white p-8 my-16 rounded-xl">
            <div className="max-w-2xl mx-auto py-8 px-4 py16  sm:py- sm:px-6 lg:px-0">
              <h1 className="text-3xl font-extrabold text-center tracking-tight text-gray-900 sm:text-4xl">
                Shopping Cart
              </h1>

              <form className="mt-12">
                <section aria-labelledby="cart-heading">
                  <h2 id="cart-heading" className="sr-only">
                    Items in your shopping cart
                  </h2>

                  <ul
                    role="list"
                    className="border-t border-b border-gray-200 divide-y divide-gray-200"
                  >
                    {products.map((product, index) => (
                      <li key={index} className="flex py-6">
                        <div className="flex-shrink-0">
                          <img
                            src={product.product.thumbnail}
                            alt={product.product.title}
                            className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                          <div>
                            <div className="flex justify-between">
                              <h4 className="text-sm">
                                <a
                                  href={`/product-detail/:${product.product.id}`}
                                  className="font-medium text-gray-700 hover:text-gray-800"
                                >
                                  {product.product.title}
                                </a>
                                <div className="flex text-black justify-center items-center mb-4 mt-4">
                                  <span className="mr-2">Quantity:</span>
                                  <select
                                    className="block w-16 px-2 py-1 mt-1 text-sm leading-tight  border border-gray-400 rounded appearance-none focus:outline-none focus:bg-white"
                                    value={product?.quantity}
                                    onChange={(e) => {
                                      handleQuantityChange(e, product);
                                    }}
                                  >
                                    {[...Array(10).keys()].map((num) => (
                                      <option
                                        className="text-black bg-black"
                                        key={num}
                                        value={num + 1}
                                      >
                                        {num + 1}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </h4>
                              <p className="ml-4 text-sm font-medium text-gray-900">
                                {discountedPrice(product.product)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {/* {product.color} */}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {/* {product.size} */}
                            </p>
                          </div>

                          <div className="mt-4 flex-1 flex items-end justify-between">
                            <p className="flex items-center text-sm text-gray-700 space-x-2">
                              {product.product.inStock ? (
                                <CheckIcon
                                  className="flex-shrink-0 h-5 w-5 text-green-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ClockIcon
                                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                                  aria-hidden="true"
                                />
                              )}

                              <span>
                                {product.product.inStock
                                  ? "In stock"
                                  : `Will ship in ${product.product.leadTime}`}
                              </span>
                            </p>
                            <div className="ml-4">
                              <button
                                type="button"
                                className="text-black font-medium hover:text-red-500"
                                onClick={(e) => {
                                  handelDeleteItem(product.id);
                                }}
                              >
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
                {/* Order summary */}
                <section aria-labelledby="summary-heading" className="mt-10">
                  <h2 id="summary-heading" className="sr-only">
                    Order summary
                  </h2>
                  <div>
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">
                          Subtotal
                        </dt>
                        <dd className="ml-4 text-base font-medium text-gray-900">
                          {totalSum}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-1 text-sm text-gray-500">
                      Shipping and taxes will be calculated at checkout.
                    </p>
                  </div>
                  <div className="mt-10 flex text-center">
                    <button
                      type="button"
                      onClick={() => {
                        handelOrder();
                      }}
                      className="w-full bg-red-400 border border-transparent rounded-md shadow-sm py-2 px-2 text-base font-medium text-white bg-custom-darkblue2-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 "
                    >
                      {" "}
                      Order Now
                    </button>
                  </div>

                  <div className="mt-6 text-sm text-center">
                    <p>
                      or{" "}
                      <Link
                        to={"/home"}
                        className="text-black font-medium hover:text-red-500"
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </p>
                  </div>
                </section>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CheckOutPage;
