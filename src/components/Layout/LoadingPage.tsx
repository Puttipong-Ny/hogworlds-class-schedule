"use client"

import { useEffect, useState } from "react"
import { Spin, Typography, Progress } from "antd"

const { Title, Text } = Typography

export default function LoadingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsVisible(true)

    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  const customSpinner = (
    <div className="relative">
      <div className="w-16 h-16 relative">
        {/* Outer ring */}
        <div
          className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"
          style={{ borderTopColor: "#1890ff", animationDuration: "1s" }}
        />

        {/* Inner ring */}
        <div
          className="absolute inset-2 border-3 rounded-full animate-spin border-white"
          style={{ borderRightColor: "#fa8c16", animationDuration: "1.5s", animationDirection: "reverse" }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-2 border-3 rounded-full animate-spin border-red-600">
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100/30 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-orange-100/30 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/2 left-3/4 w-20 h-20 bg-blue-50/40 rounded-full animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />
      </div>

      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Custom Ant Design Spinner */}
        <div className="mb-8">
          <Spin indicator={customSpinner} size="large" />
        </div>

        <div className={`transition-all duration-800 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <Title level={2} className="!text-slate-700 !mb-2">
            กำลังโหลด...
          </Title>
          <Text className="!text-slate-500 text-base">กรุณารอสักครู่ ระบบกำลังเตรียมข้อมูลให้คุณ</Text>
        </div>

        <div className="mt-8 px-4">
          <Progress
            percent={Math.floor(progress)}
            strokeColor={{
              "0%": "#1890ff",
              "100%": "#fa8c16",
            }}
            trailColor="#f0f0f0"
            strokeWidth={6}
            showInfo={false}
            className="mb-4"
          />
          <Text className="!text-slate-400 text-sm">{Math.floor(progress)}% เสร็จสิ้น</Text>
        </div>

        <div className="flex justify-center space-x-3 mt-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.4}s`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
