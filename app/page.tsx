"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingCart, Plus, Minus, Star, Clock, Truck, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Loader2, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { UserAccountNav } from "@/components/user-account-nav"

interface HouseholdItem {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  brand: string
  unit: string
  inStock: boolean
  isOnSale?: boolean
}

interface CartItem extends HouseholdItem {
  quantity: number
}

const householdItems: HouseholdItem[] = [
  {
    id: 1,
    name: "Pembe Maize Flour",
    description: "Premium quality maize flour for ugali",
    price: 145,
    originalPrice: 160,
    image: "/placeholder.svg?height=200&width=300",
    category: "Pantry Essentials",
    brand: "Pembe",
    unit: "2kg",
    inStock: true,
    isOnSale: true,
  },
  {
    id: 2,
    name: "Brookside Milk",
    description: "Fresh whole milk, long life",
    price: 65,
    image: "/placeholder.svg?height=200&width=300",
    category: "Dairy & Eggs",
    brand: "Brookside",
    unit: "500ml",
    inStock: true,
  },
  {
    id: 3,
    name: "Royco Mchuzi Mix",
    description: "Beef flavored cooking sauce",
    price: 25,
    image: "/placeholder.svg?height=200&width=300",
    category: "Pantry Essentials",
    brand: "Royco",
    unit: "12g",
    inStock: true,
  },
  {
    id: 4,
    name: "Sukari Sugar",
    description: "Pure white granulated sugar",
    price: 180,
    originalPrice: 200,
    image: "/placeholder.svg?height=200&width=300",
    category: "Pantry Essentials",
    brand: "Sukari",
    unit: "2kg",
    inStock: true,
    isOnSale: true,
  },
  {
    id: 5,
    name: "Omo Washing Powder",
    description: "Multi-active washing powder",
    price: 320,
    image: "/placeholder.svg?height=200&width=300",
    category: "Household Cleaning",
    brand: "Omo",
    unit: "2kg",
    inStock: true,
  },
  {
    id: 6,
    name: "Colgate Toothpaste",
    description: "Total advanced whitening",
    price: 185,
    image: "/placeholder.svg?height=200&width=300",
    category: "Personal Care",
    brand: "Colgate",
    unit: "75ml",
    inStock: true,
  },
  {
    id: 7,
    name: "Pishori Rice",
    description: "Premium aromatic rice",
    price: 280,
    image: "/placeholder.svg?height=200&width=300",
    category: "Pantry Essentials",
    brand: "Pishori",
    unit: "2kg",
    inStock: true,
  },
  {
    id: 8,
    name: "Tusker Baridi",
    description: "Premium lager beer",
    price: 150,
    image: "/placeholder.svg?height=200&width=300",
    category: "Beverages",
    brand: "Tusker",
    unit: "500ml",
    inStock: true,
  },
  {
    id: 9,
    name: "Dettol Antiseptic",
    description: "Antiseptic liquid for wounds",
    price: 245,
    image: "/placeholder.svg?height=200&width=300",
    category: "Personal Care",
    brand: "Dettol",
    unit: "250ml",
    inStock: true,
  },
  {
    id: 10,
    name: "Kimbo Cooking Fat",
    description: "Pure vegetable cooking fat",
    price: 195,
    image: "/placeholder.svg?height=200&width=300",
    category: "Pantry Essentials",
    brand: "Kimbo",
    unit: "500g",
    inStock: true,
  },
  {
    id: 11,
    name: "Farmers Choice Sausages",
    description: "Premium beef sausages",
    price: 320,
    image: "/placeholder.svg?height=200&width=300",
    category: "Meat & Poultry",
    brand: "Farmers Choice",
    unit: "900g",
    inStock: true,
  },
  {
    id: 12,
    name: "Ketepa Tea Bags",
    description: "Premium black tea",
    price: 85,
    image: "/placeholder.svg?height=200&width=300",
    category: "Beverages",
    brand: "Ketepa",
    unit: "50 bags",
    inStock: true,
  },
]

const categories = [
  "All",
  "Fresh Produce",
  "Dairy & Eggs",
  "Meat & Poultry",
  "Pantry Essentials",
  "Personal Care",
  "Household Cleaning",
  "Beverages",
  "Snacks & Confectionery",
]

export default function CitizenDukaClone() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    deliveryNotes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [transactionId, setTransactionId] = useState("")

  // Pre-fill customer info from user profile if logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address,
      }))
    }
  }, [user])

  const filteredItems = householdItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item: HouseholdItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === id)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prevCart.filter((cartItem) => cartItem.id !== id)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const validatePhoneNumber = (phone: string) => {
    // Kenyan phone number validation (254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX)
    const kenyaPhoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/
    return kenyaPhoneRegex.test(phone.replace(/\s+/g, ""))
  }

  const formatPhoneNumber = (phone: string) => {
    // Convert to 254XXXXXXXXX format
    const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "")
    if (cleaned.startsWith("0")) {
      return "254" + cleaned.substring(1)
    }
    if (cleaned.startsWith("254")) {
      return cleaned
    }
    return "254" + cleaned
  }

  const processMpesaPayment = async () => {
    if (!validatePhoneNumber(customerInfo.phone)) {
      alert("Please enter a valid Kenyan phone number")
      return
    }

    setIsProcessingPayment(true)
    setPaymentStatus("processing")

    try {
      const formattedPhone = formatPhoneNumber(customerInfo.phone)
      const amount = getTotalPrice()

      // Use the updated STK Push API with real M-Pesa
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount,
          accountReference: `CD${Date.now()}`,
          transactionDesc: `CitizenDuka Order Payment`,
          customerName: customerInfo.name,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.checkoutRequestId)
        // Poll for payment status
        pollPaymentStatus(data.checkoutRequestId)
      } else {
        throw new Error(data.message || "Payment initiation failed")
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error)
      setPaymentStatus("failed")
      setIsProcessingPayment(false)
      alert("Payment failed. Please try again.")
    }
  }

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    let attempts = 0
    const maxAttempts = 30 // Poll for 2.5 minutes

    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`)
        const data = await response.json()

        if (data.status === "completed") {
          setPaymentStatus("success")
          setIsProcessingPayment(false)
          // Clear cart after successful payment
          setTimeout(() => {
            setCart([])
            setIsCheckoutOpen(false)
            setPaymentStatus("idle")
          }, 3000)
        } else if (data.status === "failed" || data.status === "cancelled") {
          setPaymentStatus("failed")
          setIsProcessingPayment(false)
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setPaymentStatus("failed")
          setIsProcessingPayment(false)
          alert("Payment timeout. Please check your M-Pesa messages.")
        }
      } catch (error) {
        console.error("Status polling error:", error)
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000)
        } else {
          setPaymentStatus("failed")
          setIsProcessingPayment(false)
        }
      }
    }

    poll()
  }

  const handleCheckout = () => {
    if (paymentMethod === "mpesa") {
      processMpesaPayment()
    } else {
      // Handle other payment methods
      alert("Other payment methods coming soon!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg">
                <h1 className="text-xl font-bold text-red-600">CitizenDuka</h1>
              </div>
              <div className="hidden md:flex items-center text-white text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for household items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-white text-sm">
                <Phone className="h-4 w-4 mr-1" />
                <span>0700 123 456</span>
              </div>

              {/* User Account Navigation */}
              <UserAccountNav />

              {/* Test STK Button */}
              <Link href="/test-stk">
                <Button variant="outline" className="bg-yellow-500 text-black hover:bg-yellow-400 text-xs">
                  🧪 Test STK
                </Button>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative bg-white text-red-600 hover:bg-gray-100">
                    <ShoppingCart className="h-4 w-4" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-500">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Your Shopping Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500">
                                  {item.brand} - {item.unit}
                                </p>
                                <p className="text-sm font-semibold text-red-600">KES {item.price}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium">{item.quantity}</span>
                                <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total: KES {getTotalPrice().toLocaleString()}</span>
                          </div>
                          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                                Proceed to Checkout
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Checkout - KES {getTotalPrice().toLocaleString()}</DialogTitle>
                              </DialogHeader>

                              {paymentStatus === "success" ? (
                                <div className="text-center py-8">
                                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
                                  <p className="text-gray-600 mb-4">
                                    Your order has been confirmed and will be delivered soon.
                                  </p>
                                  <p className="text-sm text-gray-500">Transaction ID: {transactionId}</p>
                                </div>
                              ) : paymentStatus === "processing" ? (
                                <div className="text-center py-8">
                                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                                  <h3 className="text-lg font-semibold text-blue-600 mb-2">Processing Payment...</h3>
                                  <p className="text-gray-600 mb-4">Please check your phone for M-Pesa prompt</p>
                                  <p className="text-sm text-gray-500">Enter your M-Pesa PIN to complete payment</p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Customer Information */}
                                  <div className="space-y-4">
                                    <h3 className="font-semibold">Delivery Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                          id="name"
                                          value={customerInfo.name}
                                          onChange={(e) => handleCustomerInfoChange("name", e.target.value)}
                                          placeholder="John Doe"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                          id="phone"
                                          value={customerInfo.phone}
                                          onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
                                          placeholder="0712345678"
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="email">Email (Optional)</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={customerInfo.email}
                                        onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
                                        placeholder="john@example.com"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="address">Delivery Address *</Label>
                                      <Textarea
                                        id="address"
                                        value={customerInfo.address}
                                        onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
                                        placeholder="Building, Street, Area, City"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                                      <Textarea
                                        id="notes"
                                        value={customerInfo.deliveryNotes}
                                        onChange={(e) => handleCustomerInfoChange("deliveryNotes", e.target.value)}
                                        placeholder="Special delivery instructions..."
                                      />
                                    </div>

                                    {!user && (
                                      <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                          <Link href="/register" className="font-medium hover:underline">
                                            Create an account
                                          </Link>{" "}
                                          or{" "}
                                          <Link href="/login" className="font-medium hover:underline">
                                            sign in
                                          </Link>{" "}
                                          to save your delivery details for future orders.
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Order Summary */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Order Summary</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                      {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                          <span>
                                            {item.name} x{item.quantity}
                                          </span>
                                          <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                      ))}
                                      <Separator />
                                      <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>KES {getTotalPrice().toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Method */}
                                  <div className="space-y-4">
                                    <h3 className="font-semibold">Payment Method</h3>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="mpesa"
                                          name="payment"
                                          value="mpesa"
                                          checked={paymentMethod === "mpesa"}
                                          onChange={(e) => setPaymentMethod(e.target.value)}
                                          className="text-red-600"
                                        />
                                        <Label htmlFor="mpesa" className="flex items-center space-x-2 cursor-pointer">
                                          <Smartphone className="h-4 w-4 text-green-600" />
                                          <span>M-Pesa (Real STK Push)</span>
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="card"
                                          name="payment"
                                          value="card"
                                          checked={paymentMethod === "card"}
                                          onChange={(e) => setPaymentMethod(e.target.value)}
                                          className="text-red-600"
                                        />
                                        <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                                          <CreditCard className="h-4 w-4 text-blue-600" />
                                          <span>Credit/Debit Card (Coming Soon)</span>
                                        </Label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Checkout Button */}
                                  <Button
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={
                                      !customerInfo.name ||
                                      !customerInfo.phone ||
                                      !customerInfo.address ||
                                      isProcessingPayment ||
                                      paymentMethod !== "mpesa"
                                    }
                                  >
                                    {isProcessingPayment ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Smartphone className="h-4 w-4 mr-2" />
                                        Pay with M-Pesa - KES {getTotalPrice().toLocaleString()}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Trusted Online Supermarket</h2>
          <p className="text-lg mb-6">Quality household items delivered to your doorstep across Kenya</p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>Same Day Delivery</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              <span>Free Delivery Above KES 2,000</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-red-200 text-red-600 hover:bg-red-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                    {item.isOnSale && <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">SALE</Badge>}
                    {!item.inStock && <Badge className="absolute top-2 right-2 bg-gray-500">Out of Stock</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.brand} - {item.unit}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-red-600">KES {item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          KES {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.isOnSale && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Save KES {((item.originalPrice || 0) - item.price).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {item.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CitizenDuka</h3>
              <p className="text-gray-300">Your trusted online supermarket for quality household items across Kenya.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>📞 0700 123 456</p>
                <p>📧 info@citizenduka.co.ke</p>
                <p>📍 Nairobi, Kenya</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Delivery Areas</h3>
              <div className="text-gray-300">
                <p>Nairobi • Mombasa • Kisumu</p>
                <p>Nakuru • Eldoret • Thika</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
