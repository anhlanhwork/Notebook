/* Seed data — schema v3.
   Structure: data.notebooks[] → notebook.modules[] → module.features[]
*/

export const uid = (p = "x") =>
  p + "_" + Math.random().toString(36).slice(2, 7);

/* ── Individual modules ── */
export const SALES = {
  id: "mod_sale",
  name: "Sales",
  tech: "sale",
  color: "#5BAA50",
  status: "studying",
  updatedAt: "2026-05-13",
  overview: {
    version: "18.0",
    category: "Bán hàng",
    depends: "base, mail, account, stock, product, portal",
    menu: "Sales ▸ Orders ▸ Quotations",
    purpose:
      "Quản lý toàn bộ quy trình bán hàng từ báo giá → đơn hàng → giao hàng → hóa đơn. Tích hợp với Inventory để xuất kho và Accounting để ghi nhận doanh thu. Hỗ trợ giá theo bảng giá, chiết khấu, thuế đa cấp, và quy trình duyệt nhiều cấp."
  },
  mainFlows: [],
  features: [
    {
      id: "f_sale_1",
      name: "Tạo & Xác nhận báo giá",
      desc: "Tạo bản nháp, gửi khách, xác nhận đơn hàng",
      models: {
        cards: [
          {
            id: "mc_so", name: "sale.order", color: "#5BAA50", x: 40, y: 40, width: 310,
            fields: [
              { name: "name",         type: "Char",      desc: "Mã đơn (SO00…)", req: true },
              { name: "partner_id",   type: "Many2one",  desc: "Khách hàng",     req: true, relTo: "mc_partner" },
              { name: "pricelist_id", type: "Many2one",  desc: "Bảng giá" },
              { name: "state",        type: "Selection", desc: "draft/sent/sale" },
              { name: "date_order",   type: "Datetime",  desc: "Ngày báo giá",   req: true },
              { name: "order_line",   type: "One2many",  desc: "Chi tiết đơn",   relTo: "mc_sol" },
              { name: "amount_total", type: "Monetary",  desc: "Tổng tiền" }
            ]
          },
          {
            id: "mc_sol", name: "sale.order.line", color: "#378ADD", x: 420, y: 40, width: 310,
            fields: [
              { name: "order_id",      type: "Many2one",  desc: "Đơn hàng",       req: true, relTo: "mc_so" },
              { name: "product_id",    type: "Many2one",  desc: "Sản phẩm",       req: true },
              { name: "product_uom_c", type: "Float",     desc: "Số lượng",       req: true },
              { name: "price_unit",    type: "Float",     desc: "Đơn giá" },
              { name: "discount",      type: "Float",     desc: "% chiết khấu" },
              { name: "tax_id",        type: "Many2many", desc: "Thuế áp dụng" },
              { name: "price_subtotal",type: "Monetary",  desc: "Thành tiền" }
            ]
          },
          {
            id: "mc_partner", name: "res.partner", color: "#D85A30", x: 40, y: 380, width: 310,
            fields: [
              { name: "name",          type: "Char",     desc: "Tên KH",   req: true },
              { name: "vat",           type: "Char",     desc: "MST" },
              { name: "property_paym", type: "Many2one", desc: "Điều khoản thanh toán" }
            ]
          }
        ]
      },
      flows: [],
      detailBlocks: [
        {
          id: "db_s1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Cho phép sales tạo nhanh báo giá cho khách hàng từ catalog sản phẩm, gửi qua email, và theo dõi trạng thái duyệt.</p><p>Áp dụng cho cả <b>B2B</b> (cần báo giá có ký) và <b>B2C</b> (giỏ hàng online qua portal).</p>"
        },
        {
          id: "db_s2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Tạo <code>sale.order</code> (draft) — auto fill địa chỉ giao/xuất hóa đơn từ <code>res.partner</code></li><li>Chọn sản phẩm, số lượng × giá × chiết khấu × thuế</li><li>Bấm <b>Send by Email</b> để gửi PDF báo giá (template <code>sale.email_template_edi_sale</code>)</li><li>Khi khách OK → bấm <b>Confirm</b> → state đổi sang <code>sale</code>, sinh <code>stock.picking</code> + <code>account.move</code></li></ol>"
        },
        {
          id: "db_s3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Báo giá có thể có nhiều version (revision) — Odoo tự tăng số <mark style='background:#FEF08A'>(SO0001 → SO0001-1)</mark></li><li>Mỗi dòng order_line auto-tính <code>price_subtotal = qty × (unit − discount%) × (1 + tax%)</code></li><li>Pricelist quyết định <code>price_unit</code> mặc định khi chọn sản phẩm</li><li>Báo giá có <code>validity_date</code> — sau ngày này khách không click confirm được từ portal</li></ul>"
        }
      ],
      integrations: [
        { id:"int_s1", module:"product", icon:"ti-package", color:"#5BAA50", direction:"in",
          content:"<p>Lấy danh sách sản phẩm + giá vốn + đơn vị tính từ <code>product.product</code>.</p><p>Khi chọn sản phẩm vào order_line, các trường auto-fill:</p><ul><li><code>name</code> ← product.display_name</li><li><code>price_unit</code> ← product.list_price (hoặc pricelist nếu có)</li><li><code>tax_id</code> ← product.taxes_id</li><li><code>product_uom</code> ← product.uom_id</li></ul>" },
        { id:"int_s2", module:"res.partner", icon:"ti-user", color:"#7C3AED", direction:"in",
          content:"<p>Thông tin khách hàng: tên, MST, địa chỉ. Khi chọn partner_id:</p><ul><li>Auto chọn <code>pricelist_id</code> từ <code>partner.property_product_pricelist</code></li><li>Auto chọn <code>payment_term_id</code> từ <code>partner.property_payment_term_id</code></li><li>Auto fill địa chỉ giao hàng / xuất hóa đơn</li></ul>" },
        { id:"int_s3", module:"stock", icon:"ti-truck", color:"#D97706", direction:"out",
          content:"<p>Khi confirm SO, hệ thống tạo <code>stock.picking</code> (loại Outgoing) theo warehouse của SO.</p><p>Mỗi <code>order_line</code> có sản phẩm storable sẽ sinh 1 <code>stock.move</code>.</p>" },
        { id:"int_s4", module:"account", icon:"ti-calculator", color:"#2563EB", direction:"out",
          content:"<p>Khi invoice SO → tạo <code>account.move</code> (type: out_invoice).</p><p>Mapping: <code>sale.order.line</code> → <code>account.move.line</code> theo <code>invoice_policy</code> (ordered / delivered).</p>" },
        { id:"int_s5", module:"portal", icon:"ti-world", color:"#0891B2", direction:"bidi",
          content:"<p>Khách hàng có thể xem báo giá, xác nhận, và tải PDF qua portal link.</p><p>Portal user có thể sign online → cập nhật <code>signature</code> trên SO.</p>" }
      ],
      notes: "",
      cases: [
        {
          id: "cs_s1",
          title: "Báo giá không tự fill pricelist",
          status: "resolved",
          chatLink: "",
          description: "Khi tạo SO cho khách hàng đã có pricelist cố định trong cấu hình, hệ thống không tự điền pricelist_id mà để trống — sales phải chọn tay mỗi lần.",
          images: [],
          cause: "Partner chưa được set property_product_pricelist. Field này là company-dependent property, không phải trường thông thường.",
          resolution: "Vào menu Sales ▸ Configuration ▸ Settings, bật 'Pricelists'. Sau đó mở form partner → tab Sales & Purchase → set 'Pricelist' mặc định."
        }
      ]
    },
    { id: "f_sale_2", name: "Quản lý đơn hàng đã xác nhận", desc: "Theo dõi tiến độ giao hàng", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f_sale_3", name: "Giao hàng & Vận chuyển",       desc: "Tích hợp với Inventory để xuất kho", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f_sale_4", name: "Lập hóa đơn từ đơn hàng",     desc: "Sinh hóa đơn full / partial",        models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" }
  ]
};

export function emptyModule(opts) {
  return {
    id: opts.id,
    name: opts.name,
    tech: opts.tech,
    color: opts.color,
    status: opts.status || "pending",
    updatedAt: opts.updatedAt || "—",
    overview: {
      version: "18.0",
      category: opts.category || "—",
      depends: opts.depends || "base, mail",
      menu: opts.menu || "",
      purpose: opts.purpose || ""
    },
    mainFlows: [],
    features: opts.features || []
  };
}

export const PURCHASE = emptyModule({
  id: "mod_purchase", name: "Purchase", tech: "purchase",
  color: "#BA7517", status: "pending", updatedAt: "2026-05-08",
  category: "Mua hàng", depends: "base, mail, account, stock, product",
  menu: "Purchase ▸ Orders ▸ Requests for Quotation",
  purpose: "Quản lý quy trình mua hàng: yêu cầu báo giá → đơn mua → nhập kho → hóa đơn nhà cung cấp.",
  features: [
    { id: "f1", name: "Yêu cầu báo giá (RFQ)", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f2", name: "Xác nhận PO & nhập kho", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" }
  ]
});

export const STOCK = emptyModule({
  id: "mod_stock", name: "Inventory", tech: "stock",
  color: "#378ADD", status: "done", updatedAt: "2026-04-22",
  category: "Kho", depends: "base, product, mail",
  menu: "Inventory ▸ Operations ▸ Transfers",
  purpose: "Quản lý kho đa địa điểm, multi-step routes (pick/pack/ship), lot & serial, kiểm kê tồn.",
  features: [
    { id: "f1", name: "Quản lý phiếu xuất/nhập", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f2", name: "Lot & Serial tracking", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f3", name: "Multi-warehouse & Routes", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" }
  ]
});

export const ACCOUNT = emptyModule({
  id: "mod_account", name: "Accounting", tech: "account",
  color: "#7F77DD", status: "studying", updatedAt: "2026-05-11",
  category: "Kế toán", depends: "base, mail, product",
  menu: "Accounting ▸ Customers ▸ Invoices",
  purpose: "Sổ kế toán đôi đầy đủ: invoice, payment, reconciliation, báo cáo BCTC, multi-currency, multi-company.",
  features: [
    { id: "f1", name: "Hóa đơn bán & mua", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" },
    { id: "f2", name: "Thanh toán & đối chiếu", desc: "", models: { cards: [] }, flows: [], detailBlocks: [], integrations: [], notes: "" }
  ]
});

export const CRM = {
  id: "mod_crm",
  name: "CRM",
  tech: "crm",
  color: "#D4537E",
  status: "studying",
  updatedAt: "2026-05-25",
  overview: {
    version: "18.0",
    category: "Quan hệ KH",
    depends: "base, mail, sales_team, utm, calendar",
    menu: "CRM ▸ Sales ▸ My Pipeline",
    purpose:
      "Quản lý toàn bộ vòng đời khách hàng tiềm năng từ Lead → Opportunity → Won/Lost. Hợp nhất model crm.lead cho cả 2 giai đoạn (type = lead/opportunity), pipeline dạng Kanban theo crm.stage, gán Sales Team/Sales Person tự động, và nhắc lịch hoạt động (mail.activity). Khi chốt deal (Won) có thể sinh thẳng báo giá bên module Sales."
  },
  mainFlows: [
    {
      id: "mf_crm_1",
      name: "Lead → Cơ hội → Chốt deal",
      nodes: [
        { id: "n1", type: "start",    label: "Lead mới vào hệ thống",              x: 60,   y: 160 },
        { id: "n2", type: "task",     label: "Gán Sales Team & Sales Person",       x: 280,  y: 160 },
        { id: "n3", type: "gateway",  label: "Đủ điều kiện?",                       x: 520,  y: 160 },
        { id: "n9", type: "end",      label: "Loại bỏ (Junk)",                      x: 520,  y: 320 },
        { id: "n4", type: "task",     label: "Convert → Opportunity",               x: 740,  y: 60  },
        { id: "n5", type: "task",     label: "Theo dõi Pipeline (Kanban)",          x: 960,  y: 60  },
        { id: "n6", type: "gateway",  label: "Chốt được?",                          x: 1180, y: 60  },
        { id: "n7", type: "end",      label: "Won — Tạo báo giá bên Sales",         x: 1400, y: 0   },
        { id: "n8", type: "end",      label: "Lost — Ghi lý do",                    x: 1400, y: 140  }
      ],
      edges: [
        { id: "e1", from: "n1", to: "n2", label: "" },
        { id: "e2", from: "n2", to: "n3", label: "" },
        { id: "e3", from: "n3", to: "n4", label: "Có" },
        { id: "e4", from: "n3", to: "n9", label: "Không" },
        { id: "e5", from: "n4", to: "n5", label: "" },
        { id: "e6", from: "n5", to: "n6", label: "" },
        { id: "e7", from: "n6", to: "n7", label: "Thắng" },
        { id: "e8", from: "n6", to: "n8", label: "Thua" }
      ]
    }
  ],
  features: [
    {
      id: "f_crm_1",
      name: "Thu thập & Phân loại Lead",
      desc: "Nhận lead từ nhiều nguồn, tự động gán Sales Team",
      models: {
        cards: [
          {
            id: "mc_crmlead", name: "crm.lead", color: "#D4537E", x: 40, y: 40, width: 320,
            fields: [
              { name: "name",             type: "Char",      desc: "Tên cơ hội / Lead",     req: true },
              { name: "type",             type: "Selection", desc: "lead / opportunity",     req: true },
              { name: "partner_id",       type: "Many2one",  desc: "Khách hàng liên quan",   relTo: "mc_partner" },
              { name: "contact_name",     type: "Char",      desc: "Tên người liên hệ" },
              { name: "email_from",       type: "Char",      desc: "Email" },
              { name: "phone",            type: "Char",      desc: "Điện thoại" },
              { name: "source_id",        type: "Many2one",  desc: "Nguồn (utm.source)",     relTo: "mc_source" },
              { name: "team_id",          type: "Many2one",  desc: "Sales Team phụ trách",   req: true, relTo: "mc_team" },
              { name: "user_id",          type: "Many2one",  desc: "Sales Person" },
              { name: "stage_id",         type: "Many2one",  desc: "Giai đoạn pipeline" },
              { name: "probability",      type: "Float",     desc: "% xác suất chốt" },
              { name: "expected_revenue", type: "Monetary",  desc: "Doanh thu dự kiến" }
            ]
          },
          {
            id: "mc_team", name: "crm.team", color: "#378ADD", x: 440, y: 40, width: 300,
            fields: [
              { name: "name",       type: "Char",     desc: "Tên Sales Team",             req: true },
              { name: "member_ids", type: "Many2many",desc: "Thành viên trong team" },
              { name: "use_leads",  type: "Boolean",  desc: "Bật luồng Lead riêng (2 bước)" }
            ]
          },
          {
            id: "mc_source", name: "utm.source", color: "#F59E0B", x: 440, y: 260, width: 300,
            fields: [
              { name: "name", type: "Char", desc: "Nguồn: Website/Facebook Ads/Zalo/Referral…", req: true }
            ]
          },
          {
            id: "mc_partner", name: "res.partner", color: "#7C3AED", x: 40, y: 340, width: 300,
            fields: [
              { name: "name",  type: "Char", desc: "Tên khách hàng / công ty", req: true },
              { name: "email", type: "Char", desc: "Email" },
              { name: "phone", type: "Char", desc: "SĐT" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_1",
          name: "Hợp nhất Lead từ nhiều nguồn",
          nodes: [
            { id: "fn1", type: "start_message", label: "Website Form",                  x: 40,  y: 20  },
            { id: "fn2", type: "start_message", label: "Email đến",                     x: 40,  y: 140 },
            { id: "fn3", type: "start",         label: "Nhập tay (Call/Sự kiện)",        x: 40,  y: 260 },
            { id: "fn4", type: "task",          label: "Tạo crm.lead (type = lead)",     x: 280, y: 140 },
            { id: "fn5", type: "gateway",       label: "Có rule Team?",                  x: 520, y: 140 },
            { id: "fn6", type: "task",          label: "Auto-assign theo Team rule",     x: 760, y: 40  },
            { id: "fn7", type: "user_task",     label: "Sales Manager gán thủ công",     x: 760, y: 240 },
            { id: "fn8", type: "end",           label: "Lead sẵn sàng trong Pipeline",   x: 1000,y: 140 }
          ],
          edges: [
            { id: "fe1", from: "fn1", to: "fn4", label: "" },
            { id: "fe2", from: "fn2", to: "fn4", label: "" },
            { id: "fe3", from: "fn3", to: "fn4", label: "" },
            { id: "fe4", from: "fn4", to: "fn5", label: "" },
            { id: "fe5", from: "fn5", to: "fn6", label: "Có" },
            { id: "fe6", from: "fn5", to: "fn7", label: "Không" },
            { id: "fe7", from: "fn6", to: "fn8", label: "" },
            { id: "fe8", from: "fn7", to: "fn8", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c1", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Gom mọi đầu mối khách hàng tiềm năng (website, email, gọi điện, sự kiện, quảng cáo) về một chỗ duy nhất — <code>crm.lead</code>.</p><p>Áp dụng cho cả mô hình <b>1 bước</b> (Lead = Opportunity luôn) và <b>2 bước</b> (bật <code>use_leads</code> trên Team để có hàng chờ duyệt Lead trước khi convert).</p>"
        },
        {
          id: "db_c2", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Lead vào hệ thống (form web, alias email, hoặc tạo tay) — trạng thái <code>type = lead</code></li><li>Hệ thống match <b>Team rule</b> theo từ khoá/khu vực để auto-gán <code>team_id</code> + <code>user_id</code></li><li>Sales Person xem chi tiết, gọi xác nhận nhu cầu</li><li>Nếu đủ điều kiện → bấm <b>Convert to Opportunity</b> → sinh <code>stage_id</code> đầu tiên trong pipeline</li><li>Nếu không phù hợp → đánh dấu <b>Lost</b> ngay từ giai đoạn Lead (junk)</li></ol>"
        },
        {
          id: "db_c3", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Trùng lead (cùng email/SĐT trong 30 ngày) → hệ thống cảnh báo <mark style='background:#FEF08A'>duplicate lead</mark>, gợi ý merge</li><li><code>probability</code> mặc định lấy theo cấu hình % của <code>stage_id</code>, có thể override tay</li><li>Lead không có hoạt động (activity) quá 15 ngày sẽ bị gắn cờ <b>Lead nguội</b> trên Kanban</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c1", module: "website", icon: "ti-world", color: "#0891B2", direction: "in",
          content: "<p>Form \"Liên hệ\" / \"Đăng ký demo\" trên website tạo thẳng <code>crm.lead</code> qua controller <code>website_crm</code>.</p><p>UTM (<code>source_id</code>, <code>medium_id</code>, <code>campaign_id</code>) được tự động gắn từ query string của landing page.</p>" },
        { id: "int_c2", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "in",
          content: "<p>Email gửi tới alias catch-all (vd <code>sales@company.com</code>) được <code>mail.gateway</code> parse thành lead mới, đính kèm file làm attachment.</p>" },
        { id: "int_c3", module: "sales_team", icon: "ti-users", color: "#378ADD", direction: "bidi",
          content: "<p>Team rule (dựa trên khu vực / từ khoá / round-robin) quyết định <code>team_id</code> + <code>user_id</code> khi lead vào.</p><p>Ngược lại, số liệu lead/opportunity theo team hiển thị trên Team Dashboard.</p>" },
        { id: "int_c4", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "out",
          content: "<p>Khi Opportunity chuyển sang giai đoạn <code>is_won = true</code>, có thể bấm <b>New Quotation</b> để tạo thẳng <code>sale.order</code> với <code>partner_id</code> kế thừa từ Lead.</p>" }
      ],
      notes: "Cân nhắc thêm bước gọi API check trùng số điện thoại/email ngay tại form website, thay vì để hệ thống cảnh báo duplicate sau khi lead đã tạo.",
      cases: [
        {
          id: "cs_c1",
          title: "Lead từ website không tự gán Sales Team",
          status: "resolved",
          chatLink: "",
          description: "Lead tạo từ form website luôn rơi vào Team mặc định (\"Website\") thay vì đúng team khu vực, dù đã cấu hình Team Rule theo từ khoá.",
          images: [],
          cause: "Team Rule dùng field 'Assignment Domain' nhưng lead từ website không set sẵn trường được domain filter tới (vd. state_id), nên rule không khớp và rơi về default.",
          resolution: "Sửa Assignment Domain để không phụ thuộc field trống khi tạo từ web (thêm điều kiện OR chấp nhận rỗng), hoặc yêu cầu form web bắt buộc nhập Tỉnh/Thành trước khi submit."
        }
      ]
    },
    {
      id: "f_crm_2",
      name: "Quản lý Pipeline cơ hội (Kanban)",
      desc: "Theo dõi cơ hội theo từng giai đoạn, dự báo doanh thu",
      models: {
        cards: [
          {
            id: "mc_stage", name: "crm.stage", color: "#F59E0B", x: 40, y: 40, width: 300,
            fields: [
              { name: "name",     type: "Char",     desc: "Tên giai đoạn: New/Qualified/Proposition/Won", req: true },
              { name: "sequence", type: "Integer",  desc: "Thứ tự hiển thị trên Kanban" },
              { name: "is_won",   type: "Boolean",  desc: "Đánh dấu đây là giai đoạn Thắng" },
              { name: "team_id",  type: "Many2one", desc: "Giới hạn giai đoạn theo Team (nếu có)" }
            ]
          },
          {
            id: "mc_lead2", name: "crm.lead", color: "#D4537E", x: 400, y: 40, width: 320,
            fields: [
              { name: "stage_id",        type: "Many2one",  desc: "Giai đoạn hiện tại", relTo: "mc_stage" },
              { name: "probability",     type: "Float",     desc: "% xác suất chốt (auto theo stage)" },
              { name: "expected_revenue",type: "Monetary",  desc: "Doanh thu dự kiến" },
              { name: "date_deadline",   type: "Date",      desc: "Hạn chót dự kiến chốt" },
              { name: "kanban_state",    type: "Selection", desc: "normal / done / blocked" },
              { name: "lost_reason_id",  type: "Many2one",  desc: "Lý do Lost (bắt buộc nếu Lost)" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_2",
          name: "Tự động hoá khi đổi giai đoạn",
          nodes: [
            { id: "gn1", type: "start",   label: "User kéo thẻ sang cột mới",              x: 40,  y: 140 },
            { id: "gn2", type: "task",    label: "Cập nhật stage_id + probability",         x: 280, y: 140 },
            { id: "gn3", type: "gateway", label: "Stage = Won?",                            x: 520, y: 140 },
            { id: "gn4", type: "task",    label: "Set probability=100%, khoá kéo tiếp",     x: 760, y: 40  },
            { id: "gn5", type: "task",    label: "Log hoạt động \"Đổi giai đoạn\"",         x: 760, y: 240 },
            { id: "gn6", type: "end",     label: "Pipeline cập nhật",                       x: 1000,y: 140 }
          ],
          edges: [
            { id: "ge1", from: "gn1", to: "gn2", label: "" },
            { id: "ge2", from: "gn2", to: "gn3", label: "" },
            { id: "ge3", from: "gn3", to: "gn4", label: "Có" },
            { id: "ge4", from: "gn3", to: "gn5", label: "Không" },
            { id: "ge5", from: "gn4", to: "gn6", label: "" },
            { id: "ge6", from: "gn5", to: "gn6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c4", icon: "ti-layout-kanban", title: "Cách vận hành Kanban",
          content: "<p>Mỗi cột là 1 <code>crm.stage</code>. Kéo-thả thẻ giữa các cột sẽ cập nhật <code>stage_id</code> và tự tính lại <code>probability</code> theo % cấu hình của stage đích.</p><p>Cột cuối (<code>is_won = true</code>) khi thả thẻ vào sẽ tự set <code>probability = 100</code> và khoá không cho kéo tiếp.</p>"
        },
        {
          id: "db_c5", icon: "ti-chart-bar", title: "Dự báo doanh thu (Forecast)",
          content: "<p>Doanh thu dự báo theo tháng = <code>Σ expected_revenue × probability%</code> của các opportunity đang mở, nhóm theo <code>date_deadline</code>.</p><p>Có thể lọc theo Team hoặc Sales Person để xem forecast riêng từng người.</p>"
        }
      ],
      integrations: [
        { id: "int_c5", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "bidi",
          content: "<p>Mỗi lần lên lịch hẹn/demo với khách trên Opportunity sẽ tạo <code>calendar.event</code> liên kết ngược qua <code>opportunity_id</code>.</p>" }
      ],
      notes: "Cân nhắc thêm rule tự động 'nhắc gọi lại' nếu Opportunity nằm yên 1 chỗ quá 10 ngày không đổi stage.",
      cases: [
        {
          id: "cs_c2",
          title: "Kéo thẻ qua Won nhưng probability không tự về 100%",
          status: "resolved",
          chatLink: "",
          description: "Sales kéo Opportunity vào cột 'Won' nhưng % xác suất vẫn giữ nguyên giá trị cũ (vd 70%) thay vì tự nhảy lên 100%, gây sai lệch báo cáo forecast.",
          images: [],
          cause: "Cột Won được tạo thủ công nhưng quên tick is_won = true trên crm.stage, nên hệ thống không nhận diện đây là giai đoạn thắng.",
          resolution: "Vào Settings ▸ Sales ▸ CRM ▸ Stages, mở stage 'Won', tick 'Is Won Stage'. Chạy lại action 'Recompute probability' cho các opportunity cũ nếu cần."
        }
      ]
    },
    {
      id: "f_crm_3",
      name: "Lịch hoạt động & Nhắc nhở",
      desc: "Đặt lịch gọi/email/họp, cảnh báo quá hạn",
      models: {
        cards: [
          {
            id: "mc_activity", name: "mail.activity", color: "#9CA3AF", x: 40, y: 40, width: 300,
            fields: [
              { name: "activity_type_id", type: "Many2one", desc: "Loại: Gọi điện/Email/Họp/Việc cần làm", req: true },
              { name: "summary",          type: "Char",     desc: "Tóm tắt việc cần làm" },
              { name: "date_deadline",    type: "Date",     desc: "Hạn hoàn thành", req: true },
              { name: "user_id",          type: "Many2one", desc: "Người phụ trách" },
              { name: "res_id",           type: "Integer",  desc: "ID bản ghi crm.lead liên quan" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_3",
          name: "Vòng đời một hoạt động (Activity)",
          nodes: [
            { id: "an1", type: "start",   label: "Sales lên lịch hoạt động",                x: 40,  y: 140 },
            { id: "an2", type: "task",    label: "Tạo mail.activity (gọi/họp/email)",       x: 280, y: 140 },
            { id: "an3", type: "gateway", label: "Tới hạn mà chưa xong?",                   x: 520, y: 140 },
            { id: "an4", type: "task",    label: "Đánh dấu quá hạn — chấm đỏ Kanban",       x: 760, y: 40  },
            { id: "an5", type: "task",    label: "Đánh dấu hoàn thành",                     x: 760, y: 240 },
            { id: "an6", type: "end",     label: "Kết thúc hoạt động",                      x: 1000,y: 140 }
          ],
          edges: [
            { id: "ae1", from: "an1", to: "an2", label: "" },
            { id: "ae2", from: "an2", to: "an3", label: "" },
            { id: "ae3", from: "an3", to: "an4", label: "Quá hạn" },
            { id: "ae4", from: "an3", to: "an5", label: "Xong đúng hạn" },
            { id: "ae5", from: "an4", to: "an6", label: "" },
            { id: "ae6", from: "an5", to: "an6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c6", icon: "ti-bell", title: "Nhắc nhở & cảnh báo trễ hạn",
          content: "<p>Lead/Opportunity quá hạn hoạt động (activity <code>date_deadline</code> < hôm nay) sẽ hiện chấm đỏ trên thẻ Kanban và trong mục <b>Hoạt động của tôi</b>.</p>"
        },
        {
          id: "db_c7", icon: "ti-list-numbers", title: "Loại hoạt động thường dùng",
          content: "<ul><li><b>Gọi điện</b> — mặc định hẹn lại trong ngày</li><li><b>Email</b> — auto tạo khi gửi báo giá</li><li><b>Họp / Demo</b> — đồng bộ 2 chiều với Calendar</li><li><b>Việc cần làm</b> — nhắc việc nội bộ, không gắn khách hàng</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c6", module: "calendar", icon: "ti-calendar", color: "#EC4899", direction: "out",
          content: "<p>Hoạt động loại 'Họp' đồng bộ 2 chiều với <code>calendar.event</code> — đổi giờ trên Calendar sẽ cập nhật ngược lại <code>date_deadline</code> của activity.</p>" }
      ],
      notes: "Cân nhắc bật email nhắc nhở hằng ngày (digest) cho Sales Person có activity quá hạn — hiện chỉ hiện trên UI, chưa có email tự động.",
      cases: [
        {
          id: "cs_c3",
          title: "Không nhận được nhắc nhở khi hoạt động quá hạn",
          status: "investigating",
          chatLink: "",
          description: "Sales Person phản ánh không thấy nhắc nhở nào (email/thông báo) khi activity quá hạn, chỉ tình cờ thấy chấm đỏ trên Kanban khi mở app lên.",
          images: [],
          cause: "Hệ thống hiện chỉ hiển thị cảnh báo trên UI (badge đỏ), chưa bật digest email nhắc việc quá hạn hằng ngày.",
          resolution: "Đang đề xuất bật Scheduled Action 'Mail Activity: Reminder' + cấu hình mail template nhắc việc quá hạn (xem thêm phần Ghi chú)."
        }
      ]
    },
    {
      id: "f_crm_4",
      name: "Chốt deal & Chuyển thành đơn hàng",
      desc: "Won → tạo báo giá bên Sales, đóng Opportunity",
      models: {
        cards: [
          {
            id: "mc_wonlead", name: "crm.lead", color: "#D4537E", x: 40, y: 40, width: 300,
            fields: [
              { name: "name",             type: "Char",     desc: "Tên cơ hội",             req: true },
              { name: "partner_id",       type: "Many2one", desc: "Khách hàng",              req: true, relTo: "mc_partner3" },
              { name: "expected_revenue", type: "Monetary", desc: "Giá trị dự kiến" },
              { name: "date_closed",      type: "Datetime", desc: "Ngày chốt thực tế" },
              { name: "stage_id",         type: "Many2one", desc: "Giai đoạn (đã đạt Won)" },
              { name: "team_id",          type: "Many2one", desc: "Sales Team" }
            ]
          },
          {
            id: "mc_so2", name: "sale.order", color: "#5BAA50", x: 400, y: 40, width: 300,
            fields: [
              { name: "name",           type: "Char",     desc: "Mã báo giá (SO)",  req: true },
              { name: "partner_id",     type: "Many2one", desc: "Khách hàng",       req: true, relTo: "mc_partner3" },
              { name: "opportunity_id", type: "Many2one", desc: "Cơ hội gốc",       relTo: "mc_wonlead" },
              { name: "amount_total",   type: "Monetary", desc: "Tổng tiền" },
              { name: "state",          type: "Selection",desc: "draft / sent / sale" }
            ]
          },
          {
            id: "mc_partner3", name: "res.partner", color: "#7C3AED", x: 40, y: 300, width: 300,
            fields: [
              { name: "name",  type: "Char", desc: "Tên khách hàng", req: true },
              { name: "email", type: "Char", desc: "Email" },
              { name: "phone", type: "Char", desc: "SĐT" }
            ]
          }
        ]
      },
      flows: [
        {
          id: "fl_crm_4",
          name: "Won → Tạo báo giá bên Sales",
          nodes: [
            { id: "wn1", type: "start",   label: "Opportunity vào stage Won",                 x: 40,  y: 140 },
            { id: "wn2", type: "task",    label: "Set probability=100%, date_closed=hôm nay", x: 280, y: 140 },
            { id: "wn3", type: "gateway", label: "Đã có Quotation chưa?",                     x: 520, y: 140 },
            { id: "wn4", type: "task",    label: "Bấm 'New Quotation' → tạo sale.order",      x: 760, y: 40  },
            { id: "wn5", type: "task",    label: "Mở Quotation có sẵn",                       x: 760, y: 240 },
            { id: "wn6", type: "end",     label: "Chuyển sang quy trình Sales",                x: 1000,y: 140 }
          ],
          edges: [
            { id: "we1", from: "wn1", to: "wn2", label: "" },
            { id: "we2", from: "wn2", to: "wn3", label: "" },
            { id: "we3", from: "wn3", to: "wn4", label: "Chưa" },
            { id: "we4", from: "wn3", to: "wn5", label: "Rồi" },
            { id: "we5", from: "wn4", to: "wn6", label: "" },
            { id: "we6", from: "wn5", to: "wn6", label: "" }
          ]
        }
      ],
      detailBlocks: [
        {
          id: "db_c8", icon: "ti-target", title: "Mục đích & Phạm vi",
          content: "<p>Đây là điểm bàn giao giữa <b>CRM</b> và <b>Sales</b>: khi Opportunity được xác nhận Thắng, Sales Person cần một thao tác duy nhất để chuyển nhu cầu khách hàng thành báo giá chính thức, không phải nhập lại thông tin từ đầu.</p>"
        },
        {
          id: "db_c9", icon: "ti-list-numbers", title: "Thao tác chính",
          content: "<ol><li>Kéo/chuyển Opportunity vào stage có <code>is_won = true</code></li><li>Hệ thống tự set <code>probability = 100</code> và <code>date_closed</code> = thời điểm hiện tại</li><li>Trên form Opportunity, bấm nút <b>New Quotation</b></li><li>Odoo tạo <code>sale.order</code> mới, kế thừa <code>partner_id</code> và ghi <code>opportunity_id</code> để truy vết ngược</li><li>Sales Person điền sản phẩm/số lượng rồi tiếp tục quy trình báo giá như bình thường bên module <b>Sales</b></li></ol>"
        },
        {
          id: "db_c10", icon: "ti-gavel", title: "Quy tắc nghiệp vụ",
          content: "<ul><li>Không cho set stage Won nếu <code>expected_revenue = 0</code> — bắt buộc nhập giá trị deal trước khi chốt</li><li>Một Opportunity chỉ nên có <mark style='background:#FEF08A'>1 Quotation gốc</mark> liên kết qua <code>opportunity_id</code> để báo cáo doanh thu không bị đếm trùng</li><li>Opportunity Won vẫn giữ nguyên trong Pipeline (không xoá) để phục vụ báo cáo lịch sử chuyển đổi (conversion rate)</li></ul>"
        }
      ],
      integrations: [
        { id: "int_c7", module: "sale", icon: "ti-shopping-cart", color: "#5BAA50", direction: "out",
          content: "<p>Tạo <code>sale.order</code> mới với <code>partner_id</code> kế thừa từ Opportunity, <code>order_line</code> để trống chờ Sales Person điền sản phẩm.</p><p><code>opportunity_id</code> được lưu lại trên đơn hàng để truy vết Opportunity gốc.</p>" },
        { id: "int_c8", module: "mail", icon: "ti-mail", color: "#2563EB", direction: "out",
          content: "<p>Khi Opportunity chuyển Won, hệ thống tự log message trên chatter + thông báo cho Sales Manager của Team theo dõi.</p>" }
      ],
      notes: "Khi khách hàng có nhiều Opportunity song song (upsell/cross-sell), cân nhắc tạo Quotation riêng cho từng Opportunity thay vì gộp chung 1 đơn.",
      cases: [
        {
          id: "cs_c4",
          title: "Tạo trùng nhiều báo giá cho 1 Opportunity",
          status: "open",
          chatLink: "",
          description: "Sales bấm nhầm nút 'New Quotation' 2 lần trên cùng 1 Opportunity đã Won, hệ thống tạo ra 2 sale.order riêng biệt cùng trỏ về 1 opportunity_id, gây khó theo dõi báo cáo doanh thu.",
          images: [],
          cause: "Nút 'New Quotation' hiện không kiểm tra đã tồn tại quotation liên kết hay chưa trước khi tạo mới.",
          resolution: "Đang đề xuất thêm gateway kiểm tra (xem Luồng xử lý) — nếu opportunity_id đã có sale.order thì đổi nút thành 'View Quotation' thay vì tạo mới."
        }
      ]
    }
  ],
  changelog: [
    { id: "cl_crm6", date: "2026-05-25", version: "0.6", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_4", title: "Vẽ luồng Won → Tạo báo giá & case trùng quotation",      desc: "Bổ sung đầy đủ model (crm.lead/sale.order), luồng xử lý và case khách hàng cho bước chuyển giao từ CRM sang Sales khi chốt deal." },
    { id: "cl_crm5", date: "2026-05-23", version: "0.5", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_3", title: "Thêm luồng vòng đời hoạt động (Activity)",                 desc: "Vẽ sơ đồ tạo → theo dõi → quá hạn/hoàn thành cho mail.activity, bổ sung case về digest email nhắc việc." },
    { id: "cl_crm4", date: "2026-05-22", version: "0.4", type: "improvement", status: "approved", author: "Lan Anh", featureId: "f_crm_2", title: "Tự động hoá cập nhật probability theo stage",              desc: "Thêm sơ đồ luồng đổi giai đoạn Kanban + case xử lý lỗi probability không tự về 100% khi Won." },
    { id: "cl_crm1", date: "2026-05-20", version: "0.3", type: "feature",     status: "approved", author: "Lan Anh", featureId: "f_crm_1", title: "Thêm luồng phân loại & gán Sales Team tự động",            desc: "Bổ sung gateway kiểm tra điều kiện đủ tiêu chuẩn trước khi convert Lead → Opportunity, kèm sơ đồ hợp nhất lead từ nhiều nguồn." },
    { id: "cl_crm2", date: "2026-05-14", version: "0.2", type: "improvement",status: "approved", author: "Lan Anh", featureId: "f_crm_2", title: "Chuẩn hoá field lost_reason_id",                            desc: "Bắt buộc chọn lý do khi đánh dấu Lost để phục vụ báo cáo lý do mất khách." },
    { id: "cl_crm3", date: "2026-05-08", version: "0.1", type: "feature",     status: "approved", author: "Lan Anh", featureId: "",         title: "Khởi tạo module CRM",                                    desc: "Research sơ bộ menu, model chính (crm.lead, crm.stage, crm.team) và vẽ luồng chính Lead → Won." }
  ]
};

export const HR = emptyModule({
  id: "mod_hr", name: "HR", tech: "hr",
  color: "#5BAA50", status: "pending", updatedAt: "—",
  category: "Nhân sự", depends: "base, mail, resource",
  menu: "Employees ▸ Employees",
  purpose: "Hồ sơ nhân viên, phòng ban, chức danh. Cơ sở cho các module Attendance / Payroll / Recruitment.",
  features: []
});

/* ── Notebooks (top-level containers) ── */
export const SEED_DATA = {
  notebooks: [
    {
      id: "nb_odoo18",
      name: "Odoo 18",
      tech: "odoo18",
      color: "#1F6B40",
      icon: "ti-settings",
      tags: ["ERP", "Odoo", "Backend"],
      description: "Sổ tay nghiên cứu các module chuẩn của Odoo 18 — Sales, Purchase, Inventory, Accounting, CRM, HR.",
      updatedAt: "2026-05-13",
      modules: [SALES, PURCHASE, STOCK, ACCOUNT, CRM, HR]
    }
  ]
};

export default SEED_DATA;
