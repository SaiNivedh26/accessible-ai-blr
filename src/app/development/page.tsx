'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaTools, FaExclamationTriangle } from 'react-icons/fa'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FeatureStatus {
  name: string
  status: 'planned' | 'in-progress' | 'testing'
  description: string
  eta?: string
}

export default function DevelopmentPage() {
  const features: FeatureStatus[] = [
    {
      name: 'Live Video Translation',
      status: 'in-progress',
      description: 'Real-time sign language translation from video input.',
      eta: 'Q3 2025'
    },
    {
      name: 'Mobile Application',
      status: 'planned',
      description: 'Native mobile apps for iOS and Android platforms.',
      eta: 'Q4 2025'
    },
    {
      name: 'Offline Mode',
      status: 'planned',
      description: 'Use the translator without internet connection.',
      eta: 'Q4 2025'
    },
    {
      name: 'Browser Extension',
      status: 'testing',
      description: 'Translate web content directly in your browser.',
      eta: 'June 2025'
    },
    {
      name: 'Multi-language Support',
      status: 'in-progress',
      description: 'Support for multiple sign language variants.',
      eta: 'Q3 2025'
    },
    {
      name: 'AI Model Improvements',
      status: 'in-progress',
      description: 'Enhanced accuracy and performance of translation model.',
      eta: 'Ongoing'
    }
  ]

  const getStatusColor = (status: FeatureStatus['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'testing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FaTools className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Under Development
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Here&apos;s what we&apos;re working on to make Sign Language Extension even better.
              Check back regularly for updates on our progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feature.status)}`}>
                    {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {feature.description}
                </p>
                {feature.eta && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expected: {feature.eta}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Important Notice
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              These features are currently under development and may not be available yet.
              We&apos;re working hard to bring them to you as soon as possible while ensuring
              the highest quality and reliability.
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="primary">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/feedback">
                <Button variant="outline">
                  Submit Feedback
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
