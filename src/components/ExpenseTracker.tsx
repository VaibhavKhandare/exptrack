'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from 'next/image'
import { toast } from "sonner"


import { useMediaQuery } from 'react-responsive';
import { EXPENSE_CATEGORIES, midVibrate, smallVibrate } from '@/commons'
import { Slider } from '@/components/ui/slider'

const ExpenseTracker: React.FC = () => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<typeof EXPENSE_CATEGORIES[number]>(EXPENSE_CATEGORIES[0])
  const [saving, setSaving] = useState('')

  const [showAmountControls, setShowAmountControls] = useState(true)
  const [showSavingControls, setShowSavingControls] = useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount && category) {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description, 
          amount: parseFloat(amount), 
          category, 
          saving: saving ? parseFloat(saving) : 0 
        }),
      })

      if (response.ok) {
        setDescription('')
        setAmount('')
        setCategory(EXPENSE_CATEGORIES[0])
        setSaving('')
        setShowAmountControls(false)
        setShowSavingControls(false)
        toast("✅ Expense Added")
        router.refresh()
        smallVibrate(navigator);
      } else {
        toast("❌ Failed to add expense")
      }
    } else {
      midVibrate(navigator);
      toast("❌ Expense Incorrect")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpense(e as unknown as React.FormEvent);
    }
  }

  const quickAddAmount = (value: number) => {
    setAmount((prevAmount) => {
      const newAmount = (parseFloat(prevAmount) || 0) + value;
      return newAmount.toString();
    });
  }

  const quickReduceAmount = (value: number) => {
    setAmount((prevAmount) => {
      const newAmount = Math.max((parseFloat(prevAmount) || 0) - value, 0);
      return newAmount.toString();
    });
  }

  const quickAddSaving = (value: number) => {
    setSaving((prevSaving) => {
      const newSaving = (parseFloat(prevSaving) || 0) + value;
      return newSaving.toString();
    });
  }

  const quickReduceSaving = (value: number) => {
    setSaving((prevSaving) => {
      const newSaving = Math.max((parseFloat(prevSaving) || 0) - value, 0);
      return newSaving.toString();
    });
  }

  const commonValues = [10, 20, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];

  const handleCategorySelect = (selectedCategory: typeof EXPENSE_CATEGORIES[number]) => {
    setShowAmountControls(false);
    setShowSavingControls(false);
    setCategory(selectedCategory);
    if (description && amount) {
      addExpense({ preventDefault: () => {} } as React.FormEvent);
    }
  }

  const categoryGroups = [
    { name: 'Travel', categories: ['Necessary Travel', 'Friends Travel', 'Other Travel'] },
    { name: 'Food', categories: ['Basic Food', 'Zomato Food', 'Hotel Food', 'Dessert'] },
    { name: 'Expenses', categories: ['Rent', 'House', 'TFG', 'Invest'] },
    { name: 'Other', categories: ['Other'] }
  ];

  return (
    <Card className="w-full max-w-md m-auto p-6 overflow-auto mt-2">
      <h1 className="text-2xl font-bold mb-6 text-center justify-center flex align-middle items-center">
        <Image
          src="/exp_tracker_logo.png"
          alt="Expense Tracker Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <div>Expense Tracker</div>
      </h1>

      <form onSubmit={addExpense} className="space-y-4">
        <div>
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                setShowAmountControls(false);
                setShowSavingControls(false);
              }}
              className={`w-full pl-10 ${
                isMobile ? "mb-4" : ""
              } border-none focus:ring-2 focus:ring-blue-500`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Image
                src={"/description.jpg"}
                alt={"saving"}
                width={24}
                height={24}
              />
            </span>
          </div>
        </div>
        <div
          onFocus={() => {
            setShowAmountControls(true);
            setShowSavingControls(false);
          }}
        >
          <div
            className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-2"}`}
          >
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 border-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Image
                  src={"/amount.png"}
                  alt={"saving"}
                  width={24}
                  height={24}
                />
              </span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showAmountControls
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <Slider
                min={0}
                max={2000}
                step={100}
                value={[parseInt(amount) || 0]}
                onValueChange={(value:any) => {
                  const newAmount = value[0].toString();
                  setAmount(newAmount);
                }}
                className="w-full py-2"
              />
              <div className="flex justify-between mb-2">
                {[10, 50, 100, 500, 1000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    onClick={() => quickAddAmount(value)}
                    variant="outline"
                    size="sm"
                    className="w-[18%]"
                  >
                    +{value}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between">
                {[10, 50, 100, 500, 1000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    onClick={() => quickReduceAmount(value)}
                    variant="outline"
                    size="sm"
                    className="w-[18%]"
                  >
                    -{value}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-2"}`}
        >
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <Input
              type="number"
              placeholder="Saving"
              value={saving}
              onChange={(e) => setSaving(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                setShowAmountControls(false);
                setShowSavingControls(true);
              }}
              className="w-full pl-10 border-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Image
                src={"/saving.jpg"}
                alt={"saving"}
                width={24}
                height={24}
              />
            </span>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showSavingControls
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col space-y-2">
              <Slider
                min={0}
                max={2000}
                step={100}
                value={[parseInt(saving) || 0]}
                onValueChange={(value:any) => {
                  const newSaving = value[0].toString();
                  setSaving(newSaving);
                }}
                className="w-full py-2"
              />
            </div>
            <div className="flex justify-between mb-2">
              {[10, 50, 100, 500, 1000].map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => quickAddSaving(value)}
                  variant="outline"
                  size="sm"
                  className="w-[18%]"
                >
                  +{value}
                </Button>
              ))}
            </div>
            <div className="flex justify-between">
              {[10, 50, 100, 500, 1000].map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => quickReduceSaving(value)}
                  variant="outline"
                  size="sm"
                  className="w-[18%]"
                >
                  -{value}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {categoryGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="flex flex-wrap gap-2">
                {group.categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    onClick={() =>
                      handleCategorySelect(
                        cat as (typeof EXPENSE_CATEGORIES)[number]
                      )
                    }
                    className={`px-3 py-2 text-sm flex items-center hover:text-gray-200 ${
                      category === cat
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <Image
                      src={getCategoryImage(
                        cat as (typeof EXPENSE_CATEGORIES)[number]
                      )}
                      alt={cat}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-600 transition-colors duration-200 w-full`}
        >
          Add
        </Button>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('DeviceMotionEvent' in window) {
              let shakeThreshold = 20;
              let lastX = null, lastY = null, lastZ = null;
              let shakeCount = 0;

              window.addEventListener('devicemotion', (event) => {
              let acceleration
                if (window.location.pathname === '/') {
                  acceleration = event.accelerationIncludingGravity;
                } else {
                  return;
                }
                if (lastX === null) {
                  lastX = acceleration.x;
                  lastY = acceleration.y;
                  lastZ = acceleration.z;
                  return;
                }

                let deltaX = Math.abs(acceleration.x - lastX);
                let deltaY = Math.abs(acceleration.y - lastY);
                let deltaZ = Math.abs(acceleration.z - lastZ);

                if (deltaX + deltaY + deltaZ > shakeThreshold) {
                  shakeCount++;
                  if (shakeCount >= 2) {
                    document.querySelector('button[type="submit"]').click();
                    shakeCount = 0;
                  }
                }

                lastX = acceleration.x;
                lastY = acceleration.y;
                lastZ = acceleration.z;
              });
            }
          `,
          }}
        />
      </form>
    </Card>
  );
};

const getCategoryImage = (category: typeof EXPENSE_CATEGORIES[number]) => {
  switch (category) {
    case 'Necessary Travel':
      return '/basictravel.jpg';
    case 'Friends Travel':
      return '/friendtravel.jpg';
    case 'Other Travel':
      return '/othertravel.jpg';
    case 'Basic Food':
      return '/basicfood.jpg';
    case 'Zomato Food':
      return '/zomatofood.jpg';
    case 'Hotel Food':
      return '/hotelfood.jpg';
    case 'Dessert':
      return '/dessert.jpg';
    case 'Rent':
      return '/rent.jpg';
    case 'House':
      return '/family.jpg';
    case 'TFG':
      return '/love.jpg';
    case 'Invest':
      return '/invest.jpg';
    case 'Savings':
      return '/saving.jpg';
    case 'Other':
      return '/other.jpg';
    default:
      return '/other.jpg';
  }
};


export default function ExpenseForm() {
  return <ExpenseTracker/>;
}