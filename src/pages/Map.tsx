import React from "react"
import { Card, Row, Col, Image } from "antd"

const MapOverview: React.FC = () => {
  const maps = [
    { title: "ใต้ดิน", src: "/maps/1.png" },
    { title: "ชั้นที่ 1", src: "/maps/2.png" },
    { title: "ชั้นที่ 2", src: "/maps/3.png" },
    { title: "ชั้นที่ 3", src: "/maps/4.png" },
    { title: "ปราสาท", src: "/maps/castle.png" },
  ]

  return (
    <Card title="แผนที่อาคาร (รวม)">
      <Row gutter={[16, 16]}>
        {maps.map((m, i) => (
          <Col xs={24} sm={12} md={12} lg={12} key={i}>
            <Card title={m.title} hoverable>
              <Image src={m.src} alt={m.title} style={{ borderRadius: 8 }} />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default MapOverview
